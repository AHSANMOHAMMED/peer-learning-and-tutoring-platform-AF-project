const BreakTimeGame = require('../models/BreakTimeGame');
const { ensureDefaultGames } = require('../services/breakTimeGameService');

const formatGame = (game) => ({
  id: game._id,
  _id: game._id,
  name: game.name,
  slug: game.slug,
  icon: game.icon,
  description: game.description,
  timerSeconds: game.timerSeconds,
  status: game.status,
  isActive: game.isActive,
  createdAt: game.createdAt,
  updatedAt: game.updatedAt
});

const getPublicGames = async (req, res) => {
  try {
    await ensureDefaultGames();
    const games = await BreakTimeGame.find({ isActive: true, status: 'active' }).sort({ createdAt: 1 });
    res.json({ success: true, data: { games: games.map(formatGame) } });
  } catch (error) {
    console.error('Public games fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};

const getAdminGames = async (req, res) => {
  try {
    await ensureDefaultGames();
    const games = await BreakTimeGame.find().sort({ createdAt: 1 });
    const stats = {
      totalGames: await BreakTimeGame.countDocuments({ status: { $ne: 'deleted' } }),
      activeGames: await BreakTimeGame.countDocuments({ status: 'active', isActive: true }),
      inactiveGames: await BreakTimeGame.countDocuments({ status: 'inactive' }),
      deletedGames: await BreakTimeGame.countDocuments({ status: 'deleted' })
    };

    res.json({ success: true, data: { games: games.map(formatGame), stats } });
  } catch (error) {
    console.error('Admin games fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch games' });
  }
};

const getAdminGameById = async (req, res) => {
  try {
    await ensureDefaultGames();
    const game = await BreakTimeGame.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, data: { game: formatGame(game) } });
  } catch (error) {
    console.error('Admin game detail error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch game' });
  }
};

const updateGameTimer = async (req, res) => {
  try {
    const timerSeconds = Number(req.body.timerSeconds);
    if (!Number.isInteger(timerSeconds) || timerSeconds < 5 || timerSeconds > 900) {
      return res.status(400).json({ success: false, message: 'Timer must be between 5 and 900 seconds' });
    }

    const game = await BreakTimeGame.findByIdAndUpdate(
      req.params.id,
      { timerSeconds },
      { new: true, runValidators: true }
    );

    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, message: 'Timer updated successfully', data: { game: formatGame(game) } });
  } catch (error) {
    console.error('Game timer update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update timer' });
  }
};

const updateGameStatus = async (req, res) => {
  try {
    const { isActive, status } = req.body;
    const nextActive = typeof isActive === 'boolean' ? isActive : status === 'active';
    const nextStatus = nextActive ? 'active' : 'inactive';

    const game = await BreakTimeGame.findOneAndUpdate(
      { _id: req.params.id, status: { $ne: 'deleted' } },
      { isActive: nextActive, status: nextStatus, deletedAt: null },
      { new: true, runValidators: true }
    );

    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, message: `Game ${nextActive ? 'activated' : 'deactivated'} successfully`, data: { game: formatGame(game) } });
  } catch (error) {
    console.error('Game status update error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

const deleteGame = async (req, res) => {
  try {
    const game = await BreakTimeGame.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'deleted', deletedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    res.json({ success: true, message: 'Game deleted successfully', data: { game: formatGame(game) } });
  } catch (error) {
    console.error('Game delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete game' });
  }
};

module.exports = {
  getPublicGames,
  getAdminGames,
  getAdminGameById,
  updateGameTimer,
  updateGameStatus,
  deleteGame
};
