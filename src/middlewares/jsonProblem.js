export const setProblemJsonHeader = (_, res, next) => {
  res.problem = (status, title, detail, instance = '') => {
    status = status || 500;
    res.status(status).json({
      type: 'https://example.com/probs/' + title.toLowerCase().replace(/\s/g, '-'),
      title,
      status,
      detail,
      instance,
    });
  };
  next();
};
