
const logger = (req, res, next) => {
    const {ip} = req; 
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl}   ${res.statusCode} - ${duration}ms from IP ${ip}`);
    });
    next();
};

module.exports = logger;
