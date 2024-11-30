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
        let verb = "is";
        if (ips.length > 1) {
          verb = "are";
        }
        let records = "none";
        if (ips.length) {
          records = ips.map((ip) => `${ip} ${domainName}`).join("\n");
        }
        return new Response(`Resolved ipv4 ${verb}:\n${records}`);
      } else {
        return new Response("Received domain name is empty.");
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
