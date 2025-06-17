import type { NextConfig } from "next";

const nextConfig = {
  images: {
    domains: [
      'media.istockphoto.com',
      'www.nathanalanjewelers.com',
      'www.longsjewelers.com',
      'img.goodfon.com',
      'hannahnaomi.com',
      'shrinejewelry.com',
      'media.gettyimages.com',
      'royalparadisejewelry.com',
      'cdn11.bigcommerce.com',
      'faithheart-jewelry.com',
      'www.shutterstock.com',
      'johnnysaintstudio.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jasonco-inspiration-images.s3.us-east-2.amazonaws.com',
        pathname: '/**',
      },
    ]
  },
};

module.exports = nextConfig;

export default nextConfig;
