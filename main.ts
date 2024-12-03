import { serveDir } from "@std/http";

const userPagePattern = new URLPattern({ pathname: "/users/:id" });
const staticPathPattern = new URLPattern({ pathname: "/static/*" });

const domainNamePagePattern = new URLPattern({ pathname: "/domain_name/:id" });

export default {
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response("Home page");
    }

    const domainNamePageMatch = domainNamePagePattern.exec(url);
    if (domainNamePageMatch) {
      const domainName = domainNamePageMatch.pathname.groups.id;
      console.log(`Received domain name is ${domainName}`);
      if (domainName) {
        const ips = await Deno.resolveDns(domainName, "A");

        let records = "none";
        if (ips.length) {
          records = ips.map((ip) => `${ip} ${domainName}`).join("\n");
        }
        return new Response(`解析到的 ipv4 地址是：\n${records}\n\n请谨慎使用，解析到的 ipv4 地址可能不是真实的地址。`);
      } else {
        return new Response("接收到的域名为空。");
      }
    }

    const userPageMatch = userPagePattern.exec(url);
    if (userPageMatch) {
      return new Response(userPageMatch.pathname.groups.id);
    }

    if (staticPathPattern.test(url)) {
      return serveDir(req);
    }

    return new Response("Not found", { status: 404 });
  },
} satisfies Deno.ServeDefaultExport;
