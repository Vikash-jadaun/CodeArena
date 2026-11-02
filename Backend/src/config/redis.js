
const {createClient}=require('redis');

const redisOptions = {
    username: process.env.REDIS_USERNAME || 'default',
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT || 6379)
    }
};

const redisPassword = process.env.REDIS_PASS;
const redisHost = process.env.REDIS_HOST || 'localhost';
const isLocalRedis = ['localhost', '127.0.0.1', '::1'].includes(redisHost);
if (redisPassword && !redisPassword.startsWith('replace-with-') && !isLocalRedis) {
    redisOptions.password = redisPassword;
}

const redisClient = createClient(redisOptions);

module.exports=redisClient;