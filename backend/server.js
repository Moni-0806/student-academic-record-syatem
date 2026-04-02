require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
});
