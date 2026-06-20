const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { checkAchievements } = require('../utils/achievementEngine');

// ── Get All Challenges ─────────────────────────────────────
exports.getChallenges = async (req, res, next) => {
  try {
    const challenges = await Challenge.find({ isActive: true }).sort({ rewardPoints: -1 });
    const userId = req.userId ? req.userId.toString() : null;
    const result = challenges.map(c => {
      const cObj = c.toJSON();
      if (userId) {
        cObj.isJoined    = c.participants.some(p => p.userId.toString() === userId);
        cObj.isCompleted = c.participants.some(p => p.userId.toString() === userId && p.completed);
        cObj.myProgress  = c.participants.find(p => p.userId.toString() === userId)?.progress || 0;
      } else {
        cObj.isJoined = false; cObj.isCompleted = false; cObj.myProgress = 0;
      }
      return cObj;
    });
    res.json({ challenges: result });
  } catch (err) { next(err); }
};

// ── Join Challenge ─────────────────────────────────────────
exports.joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });
    if (!challenge.isActive) return res.status(400).json({ error: 'This challenge has ended.' });

    const alreadyJoined = challenge.participants.some(p => p.userId.toString() === req.userId.toString());
    if (alreadyJoined) return res.status(409).json({ error: 'Already joined this challenge.' });

    challenge.participants.push({ userId: req.userId, joinedAt: new Date() });
    await challenge.save();

    // Update user's joinedChallenges
    await User.findByIdAndUpdate(req.userId, {
      $push: { joinedChallenges: { challengeId: challenge._id, joinedAt: new Date() } }
    });

    res.json({ message: `Joined "${challenge.title}"! 🌱 Good luck!`, challenge });
  } catch (err) { next(err); }
};

// ── Update Challenge Progress ──────────────────────────────
exports.updateProgress = async (req, res, next) => {
  try {
    const { progress } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

    const participant = challenge.participants.find(p => p.userId.toString() === req.userId.toString());
    if (!participant) return res.status(400).json({ error: 'You have not joined this challenge.' });

    participant.progress = Math.min(100, progress);

    if (participant.progress >= 100 && !participant.completed) {
      participant.completed = true;
      participant.completedAt = new Date();
    }
    await challenge.save();

    // Sync user's joined challenges
    const user = await User.findById(req.userId);
    const userChallenge = user.joinedChallenges.find(c => c.challengeId?.toString() === challenge._id.toString());
    if (userChallenge) {
      userChallenge.progress = participant.progress;
      userChallenge.completed = participant.completed;
      if (participant.completed) userChallenge.completedAt = new Date();
    }
    await user.save();

    res.json({ message: 'Progress updated!', progress: participant.progress, completed: participant.completed });
  } catch (err) { next(err); }
};

// ── Complete Challenge ─────────────────────────────────────
exports.completeChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ error: 'Challenge not found.' });

    const user = await User.findById(req.userId);

    // Award points
    user.totalPoints = (user.totalPoints || 0) + challenge.rewardPoints;
    user.totalCO2Saved = (user.totalCO2Saved || 0) + (challenge.co2SavedEstimate || 0);

    // Mark completed in user
    const uc = user.joinedChallenges.find(c => c.challengeId?.toString() === challenge._id.toString());
    if (uc) { uc.completed = true; uc.progress = 100; uc.completedAt = new Date(); }

    // Check challenge-related achievements
    const newAchievements = checkAchievements(user, {});
    if (newAchievements.length > 0) user.achievements.push(...newAchievements);

    await user.save();

    // Update challenge participant
    const p = challenge.participants.find(p => p.userId.toString() === req.userId.toString());
    if (p) { p.completed = true; p.progress = 100; p.completedAt = new Date(); }
    await challenge.save();

    res.json({
      message: `🏆 Challenge "${challenge.title}" completed! +${challenge.rewardPoints} points!`,
      pointsEarned: challenge.rewardPoints,
      newAchievements,
      user: user.toSafeObject()
    });
  } catch (err) { next(err); }
};

// ── My Challenges ──────────────────────────────────────────
exports.getMyChallenges = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate('joinedChallenges.challengeId');
    const mine = (user.joinedChallenges || []).filter(c => c.challengeId);
    res.json({ challenges: mine });
  } catch (err) { next(err); }
};
