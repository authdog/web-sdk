/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        NEXT_PUBLIC_PK_AUTHDOG: process.env.PK_AUTHDOG
    },
    transpilePackages: ['@authdog/react-elements'],
    experimental: {
        turbo: {
            rules: {
                '*.css': ['postcss-loader'],
            },
        },
    },
};

module.exports = nextConfig;
