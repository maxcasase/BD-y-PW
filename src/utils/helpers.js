// Utility functions
exports.formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

exports.calculateAverage = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
};

exports.paginateResults = (model, query, page, limit, populate = '') => {
  return model.find(query)
    .populate(populate)
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

exports.escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};