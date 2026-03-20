function toPublicImageUrl(req, imagePath) {
  if (!imagePath) {
    return null;
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${req.protocol}://${req.get('host')}${imagePath}`;
}

module.exports = {
  toPublicImageUrl,
};
