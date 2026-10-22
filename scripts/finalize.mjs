import {readFile,writeFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
export async function finalize(output,content) {
const paths=[]; async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){if(e.isSymbolicLink())throw Error('Symlink not allowed');if(e.isDirectory())await walk(path.join(dir,e.name));else paths.push(path.relative(output,path.join(dir,e.name)).replaceAll('\\','/'));}} await walk(output);
    const available = new Set(paths),
      removed = [];
    const anchors = new Map();
    for (const rel of paths.filter((x) => x.endsWith(".html"))) {
      const $ = load(await readFile(path.join(output, rel), "utf8"));
      anchors.set(
        rel,
        new Set(
          $("[id]")
            .toArray()
            .map((el) => $(el).attr("id")),
        ),
      );
    }
    // Prune legacy links whose local page or anchor was removed by visibility.
    for (const rel of paths.filter((x) => x.endsWith(".html"))) {
      const file = path.join(output, rel);
      const $ = load(await readFile(file, "utf8"));
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (/^mailto:/.test(href)) return;
        let target,
          fragment = "";
        try {
          const local = new URL(href, `https://cms.local/${rel}`);
          if (
            ![
              "https://cms.local",
              new URL(content.meta.siteUrl).origin,
            ].includes(local.origin)
          )
            return;
          const site = new URL(content.meta.siteUrl);
          const prefix = site.pathname.replace(/\/?$/, "/");
          if (
            local.origin !== "https://cms.local" &&
            !local.pathname.startsWith(prefix)
          )
            return;
          target = decodeURIComponent(
            local.origin === "https://cms.local"
              ? local.pathname
              : local.pathname.slice(prefix.length),
          ).replace(/^\//, "");
          if (!target) target = "index.html";
          fragment = decodeURIComponent(local.hash.slice(1));
        } catch {
          return;
        }
        if (
          (target.endsWith(".html") && !available.has(target)) ||
          (fragment &&
            anchors.has(target) &&
            !anchors.get(target).has(fragment))
        ) {
          if ($(el).hasClass("research-card"))
            $(el).replaceWith(
              $("<div>").addClass("research-card").append($(el).contents()),
            );
          else if ($(el).closest(".rich-content").length)
            $(el).replaceWith($(el).contents());
          else $(el).remove();
          removed.push(target);
        }
      });
      await writeFile(file, $.html());
    }

return removed;
}
