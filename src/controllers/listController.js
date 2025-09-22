const List = require('../models/List');

exports.createList = async (req, res) => {
  try {
    const { title, description, items, isPublic, tags } = req.body;

    const list = await List.create({
      title,
      description,
      creator: req.user.id,
      items: items || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      tags: tags || []
    });

    const populatedList = await List.findById(list._id)
      .populate('creator', 'username profile')
      .populate('items.album', 'title artist coverImage')
      .populate('items.song', 'title duration')
      .populate('tags', 'name');

    res.status(201).json({
      success: true,
      list: populatedList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLists = async (req, res) => {
  try {
    const { page = 1, limit = 10, user, tag } = req.query;
    
    let query = { isPublic: true };
    if (user) query.creator = user;
    if (tag) query.tags = tag;

    const lists = await List.find(query)
      .populate('creator', 'username profile')
      .populate('items.album', 'title artist coverImage')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await List.countDocuments(query);

    res.status(200).json({
      success: true,
      count: lists.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      lists
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id)
      .populate('creator', 'username profile')
      .populate('items.album', 'title artist coverImage releaseYear')
      .populate('items.song', 'title duration album')
      .populate('tags', 'name');

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check if private list and user is not owner
    if (!list.isPublic && list.creator._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this list'
      });
    }

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateList = async (req, res) => {
  try {
    let list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this list'
      });
    }

    list = await List.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    )
    .populate('creator', 'username profile')
    .populate('items.album', 'title artist coverImage')
    .populate('tags', 'name');

    res.status(200).json({
      success: true,
      list
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check ownership
    if (list.creator.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this list'
      });
    }

    await List.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'List deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.likeList = async (req, res) => {
  try {
    const list = await List.findById(req.params.id);

    if (!list) {
      return res.status(404).json({
        success: false,
        message: 'List not found'
      });
    }

    // Check if already liked
    if (list.likes.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'List already liked'
      });
    }

    list.likes.push(req.user.id);
    await list.save();

    res.status(200).json({
      success: true,
      message: 'List liked successfully',
      likes: list.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};