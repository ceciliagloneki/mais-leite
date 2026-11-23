const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/estoque", destination: "/dashboard", permanent: false },
      { source: "/relatorios", destination: "/dashboard", permanent: false },
    ];
  },
};

export default nextConfig;
