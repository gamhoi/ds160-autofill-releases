/* Bundled installer dependency: fflate 0.8.2
MIT License

Copyright (c) 2023 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// delivery/installer.mjs
import { execFileSync } from "node:child_process";
import { createHash, randomUUID as randomUUID2 } from "node:crypto";
import { chmod, lstat, mkdir as mkdir2, readFile as readFile2, readdir, realpath, rename, rm as rm2, stat, writeFile as writeFile2 } from "node:fs/promises";
import path2 from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var Worker;
try {
  Worker = require2("worker_threads").Worker;
} catch (e) {}
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]);
var fdeb = new u8([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0;i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1;i < 30; ++i) {
    for (var j = b[i];j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0;i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (;i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1;i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0;i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1;v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0;i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
};
var flt = new u8(288);
for (i = 0;i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144;i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256;i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280;i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0;i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1;i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l) {
    var bl = buf.length;
    if (l > bl) {
      var nbuf = new u8(Math.max(bl * 2, l));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, { l: lm, d: dm, m: lbt, n: dbt } = st;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0;i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0;i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (;; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (;bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (;bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder;
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {}
var dutf8 = function(d) {
  for (var r = "", i = 0;; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0;i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a = dutf8(dat), { s, r } = _a;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl, bs = b4(d, b + 20);
  var _a = z && bs == 4294967295 ? z64e(d, es) : [bs, b4(d, b + 24), b4(d, b + 42)], sc = _a[0], su = _a[1], off = _a[2];
  return [b2(d, b + 10), sc, su, fn, es + b2(d, b + 30) + b2(d, b + 32), off];
};
var z64e = function(d, b) {
  for (;b2(d, b) != 1; b += 4 + b2(d, b + 2))
    ;
  return [b8(d, b + 12), b8(d, b + 4), b8(d, b + 20)];
};
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (;b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = o == 4294967295 || c == 65535;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0;i < c; ++i) {
    var _a = zh(data, o, z), c_2 = _a[0], sc = _a[1], su = _a[2], fn = _a[3], no = _a[4], off = _a[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
}

// delivery/release-contract.mjs
var DOWNLOAD_REPOSITORY = "gamhoi/ds160-autofill-releases";
var STABLE_URL = "https://gamhoi.github.io/ds160-autofill-releases/stable.json";
var CONTRACT = Object.freeze({ schema_version: 1, profile_contract: 1, interaction_protocol: 1, edition: "free-b1b2", playwright: "1.62.1", minimum_node: 20 });
var TARGETS = Object.freeze({
  "bun-darwin-x64": { platform: "darwin", arch: "x64", executable: "bin/ds160" },
  "bun-darwin-arm64": { platform: "darwin", arch: "arm64", executable: "bin/ds160" },
  "bun-windows-x64": { platform: "win32", arch: "x64", executable: "bin/ds160.exe" }
});
var PUBLIC_FILES = Object.freeze([
  "SKILL.md",
  "README.md",
  "install.md",
  "release.json",
  "SHA256SUMS",
  "THIRD_PARTY_NOTICES.txt",
  "references/intake.md",
  "references/runtime.md",
  "references/setup.md",
  "references/photo.md"
]);
var RETENTION = Object.freeze({ stable_count: 5, stable_days: 90, prerelease_days: 14, artifact_days: 7 });
var validVersion = (value) => typeof value === "string" && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[a-zA-Z0-9]+(?:[.-][a-zA-Z0-9]+)*)?$/.test(value);
function assertManifest(manifest, { allowLocal = false, requireStable = false } = {}) {
  if (manifest?.release === null)
    throw new Error("NO_STABLE_RELEASE: no approved public release is available yet.");
  for (const key of ["schema_version", "edition", "playwright", "profile_contract", "interaction_protocol", "minimum_node"]) {
    if (manifest?.[key] !== CONTRACT[key])
      throw new Error(`MANIFEST_INCOMPATIBLE: ${key}`);
  }
  if (!validVersion(manifest.version) || !["stable", "candidate"].includes(manifest.channel))
    throw new Error("MANIFEST_INVALID: version or channel");
  if (requireStable && (manifest.channel !== "stable" || manifest.version.includes("-")))
    throw new Error("MANIFEST_INVALID: stable channel");
  if (!manifest.artifacts || !Object.keys(manifest.artifacts).length)
    throw new Error("MANIFEST_INVALID: no artifacts");
  for (const [target, artifact] of Object.entries(manifest.artifacts)) {
    if (!Object.hasOwn(TARGETS, target))
      throw new Error("MANIFEST_INVALID: target");
    const filename = `ds160-autofill-${manifest.version}-${target}.zip`;
    if (artifact.filename !== filename || artifact.executable !== TARGETS[target].executable || !/^[a-f0-9]{64}$/.test(artifact.sha256 || "") || !/^[a-f0-9]{24}$/.test(artifact.build_id || "") || !Number.isSafeInteger(artifact.size) || artifact.size <= 0 || artifact.size > 128 * 1024 * 1024)
      throw new Error("MANIFEST_INVALID: artifact");
    const url = new URL(artifact.url);
    const expected = `https://github.com/${DOWNLOAD_REPOSITORY}/releases/download/v${manifest.version}/${filename}`;
    if (artifact.url !== expected && !(allowLocal && url.protocol === "file:"))
      throw new Error("MANIFEST_INVALID: untrusted artifact URL");
  }
  return manifest;
}
function compareVersions(left, right) {
  if (!validVersion(left) || !validVersion(right))
    throw new Error("VERSION_INVALID");
  const [a, ap] = left.split(/-(.*)/s);
  const [b, bp] = right.split(/-(.*)/s);
  for (let i = 0;i < 3; i++) {
    const difference = Number(a.split(".")[i]) - Number(b.split(".")[i]);
    if (difference)
      return Math.sign(difference);
  }
  if (ap === bp)
    return 0;
  if (!ap || !bp)
    return ap ? -1 : 1;
  const aa = ap.split(".");
  const bb = bp.split(".");
  for (let i = 0;i < Math.max(aa.length, bb.length); i++) {
    if (aa[i] === bb[i])
      continue;
    if (aa[i] === undefined || bb[i] === undefined)
      return aa[i] === undefined ? -1 : 1;
    const an = /^\d+$/.test(aa[i]);
    const bn = /^\d+$/.test(bb[i]);
    if (an && bn)
      return Math.sign(Number(aa[i]) - Number(bb[i]));
    if (an !== bn)
      return an ? -1 : 1;
    return aa[i] < bb[i] ? -1 : 1;
  }
  return 0;
}

// delivery/install-lock.mjs
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import os from "node:os";
import path from "node:path";
function installationLockPath(destination) {
  return path.join(path.dirname(destination), `.${path.basename(destination)}-operation.lock`);
}
async function acquireInstallationLock(destination) {
  const directory = installationLockPath(destination);
  await mkdir(path.dirname(directory), { recursive: true });
  try {
    await mkdir(directory, { mode: 448 });
  } catch (error) {
    if (error.code !== "EEXIST")
      throw error;
    throw new Error(`INSTALLATION_BUSY: installation or a runner holds ${directory}. Do not remove it until its owner has exited.`);
  }
  const token = randomUUID();
  try {
    await writeFile(path.join(directory, "owner.json"), JSON.stringify({ token, pid: process.pid, host: os.hostname(), started_at: new Date().toISOString() }), { mode: 384, flag: "wx" });
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }
  return async () => {
    const owner = JSON.parse(await readFile(path.join(directory, "owner.json"), "utf8"));
    if (owner.token !== token)
      throw new Error("INSTALLATION_LOCK_CHANGED");
    await rm(directory, { recursive: true });
  };
}
async function withInstallationLock(destination, action) {
  const release = await acquireInstallationLock(destination);
  try {
    return await action();
  } finally {
    await release();
  }
}

// delivery/installer.mjs
var sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
var STATE = "install-state.json";
async function download(url, { allowLocal = false, limit = 128 * 1024 * 1024 } = {}) {
  const parsed = new URL(url);
  if (allowLocal && parsed.protocol === "file:") {
    const file = fileURLToPath(parsed);
    const info = await stat(file);
    if (!info.isFile())
      throw new Error("DOWNLOAD_FILE_NOT_REGULAR");
    if (info.size > limit)
      throw new Error("DOWNLOAD_TOO_LARGE");
    const bytes = await readFile2(file);
    if (bytes.length > limit)
      throw new Error("DOWNLOAD_TOO_LARGE");
    return bytes;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password)
    throw new Error("DOWNLOAD_URL_INVALID");
  const response = await fetch(parsed, { signal: AbortSignal.timeout(60000) });
  if (!response.ok || !response.url.startsWith("https://"))
    throw new Error(`DOWNLOAD_FAILED: HTTP ${response.status}`);
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > limit)
      throw new Error("DOWNLOAD_TOO_LARGE");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}
function inspectArchive(bytes, artifact, manifest) {
  if (bytes.length !== artifact.size || sha256(bytes) !== artifact.sha256)
    throw new Error("ARCHIVE_CHECKSUM_FAILED");
  const expected = new Set([...PUBLIC_FILES, artifact.executable]);
  const seen = new Set;
  let originalSize = 0;
  const zipped = unzipSync(bytes, { filter(info) {
    const relative = info.name.replace(/^ds160-autofill\//, "");
    if (!info.name.startsWith("ds160-autofill/") || !expected.has(relative) || seen.has(relative.toLowerCase()))
      throw new Error("ARCHIVE_FILE_NOT_ALLOWED");
    seen.add(relative.toLowerCase());
    originalSize += info.originalSize;
    const limit = relative === artifact.executable ? 96 * 1024 * 1024 : 1024 * 1024;
    if (info.originalSize > limit || originalSize > 128 * 1024 * 1024)
      throw new Error("ARCHIVE_TOO_LARGE");
    return true;
  } });
  const files = Object.fromEntries(Object.entries(zipped).map(([name, data]) => [name.slice("ds160-autofill/".length), Buffer.from(data)]));
  if (Object.keys(files).length !== expected.size)
    throw new Error("ARCHIVE_FILES_MISSING");
  let extractedSize = 0;
  for (const [name, bytes] of Object.entries(files)) {
    extractedSize += bytes.length;
    if (bytes.length > (name === artifact.executable ? 96 * 1024 * 1024 : 1024 * 1024) || extractedSize > 128 * 1024 * 1024)
      throw new Error("ARCHIVE_TOO_LARGE");
  }
  const lines = files.SHA256SUMS.toString("utf8").trim().split(`
`);
  const checksummed = new Set;
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match || match[2] === "SHA256SUMS" || !expected.has(match[2]) || checksummed.has(match[2]) || sha256(files[match[2]]) !== match[1])
      throw new Error("PACKAGE_CHECKSUM_FAILED");
    checksummed.add(match[2]);
  }
  if (checksummed.size !== expected.size - 1)
    throw new Error("PACKAGE_CHECKSUMS_MISSING");
  const metadata = JSON.parse(files["release.json"]);
  for (const key of ["version", "edition", "playwright", "profile_contract", "interaction_protocol", "schema_version", "minimum_node"]) {
    if (metadata[key] !== manifest[key])
      throw new Error(`PACKAGE_MANIFEST_MISMATCH: ${key}`);
  }
  if (metadata.build_id !== artifact.build_id || metadata.executable !== artifact.executable || metadata.protection !== "light-offline-obfuscation" || metadata.binary_sha256 !== sha256(files[artifact.executable]))
    throw new Error("PACKAGE_METADATA_INVALID");
  const target = Object.keys(TARGETS).find((key) => artifact.filename === `ds160-autofill-${manifest.version}-${key}.zip`);
  const definition = TARGETS[target];
  if (!definition || metadata.platform !== definition.platform || metadata.arch !== definition.arch)
    throw new Error("PACKAGE_PLATFORM_MISMATCH");
  return files;
}
async function candidateFromArchive(file, { platform = process.platform, arch = process.arch } = {}) {
  const target = `bun-${platform === "win32" ? "windows" : platform}-${arch}`;
  if (!Object.hasOwn(TARGETS, target))
    throw new Error("PLATFORM_NOT_SUPPORTED");
  const url = pathToFileURL(path2.resolve(file)).href;
  const bytes = await download(url, { allowLocal: true });
  let size = 0;
  let found = false;
  const entries = unzipSync(bytes, { filter(info) {
    size += info.originalSize;
    if (size > 128 * 1024 * 1024)
      throw new Error("ARCHIVE_TOO_LARGE");
    if (info.name !== "ds160-autofill/release.json")
      return false;
    if (found)
      throw new Error("ARCHIVE_FILE_NOT_ALLOWED");
    found = true;
    if (info.originalSize > 1024 * 1024)
      throw new Error("ARCHIVE_TOO_LARGE");
    return true;
  } });
  const metadataBytes = entries["ds160-autofill/release.json"];
  if (!metadataBytes)
    throw new Error("CANDIDATE_METADATA_MISSING");
  if (metadataBytes.length > 1024 * 1024)
    throw new Error("ARCHIVE_TOO_LARGE");
  let metadata;
  try {
    metadata = JSON.parse(Buffer.from(metadataBytes).toString("utf8"));
  } catch {
    throw new Error("CANDIDATE_METADATA_INVALID");
  }
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata))
    throw new Error("CANDIDATE_METADATA_INVALID");
  if (metadata.platform !== TARGETS[target].platform || metadata.arch !== TARGETS[target].arch)
    throw new Error("PACKAGE_PLATFORM_MISMATCH");
  const manifest = Object.fromEntries(Object.keys(CONTRACT).map((key) => [key, metadata[key]]));
  manifest.version = metadata.version;
  manifest.channel = "candidate";
  manifest.artifacts = { [target]: {
    filename: `ds160-autofill-${metadata.version}-${target}.zip`,
    executable: metadata.executable,
    build_id: metadata.build_id,
    sha256: sha256(bytes),
    size: bytes.length,
    url
  } };
  assertManifest(manifest, { allowLocal: true });
  inspectArchive(bytes, manifest.artifacts[target], manifest);
  return { manifest, bytes };
}
async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path2.join(directory, entry.name);
    if (entry.isSymbolicLink())
      throw new Error("INSTALLATION_SYMLINK_NOT_ALLOWED");
    if (entry.isDirectory())
      for (const item of await listFiles(child))
        files.push(`${entry.name}/${item}`);
    else if (entry.isFile())
      files.push(entry.name);
    else
      throw new Error("INSTALLATION_SPECIAL_FILE_NOT_ALLOWED");
  }
  return files;
}
async function installedState(destination) {
  const info = await lstat(destination).catch((error) => {
    if (error.code === "ENOENT")
      return null;
    throw error;
  });
  if (!info)
    return null;
  if (!info.isDirectory() || info.isSymbolicLink())
    throw new Error("INSTALLATION_NOT_MANAGED");
  const state = JSON.parse(await readFile2(path2.join(destination, STATE), "utf8").catch(() => {
    throw new Error("INSTALLATION_NOT_MANAGED: choose a new Skill directory, not an existing directory.");
  }));
  if (state.tool !== "ds160-runtime" || state.schema_version !== 1 || !validVersion(state.version) || !Object.hasOwn(TARGETS, state.target))
    throw new Error("INSTALLATION_STATE_INVALID");
  const expected = new Set([...PUBLIC_FILES, TARGETS[state.target].executable, STATE]);
  const actual = await listFiles(destination);
  if (actual.length !== expected.size || actual.some((file) => !expected.has(file)))
    throw new Error("INSTALLATION_MODIFIED: unknown files exist; preserve them outside the Skill before updating.");
  const metadata = JSON.parse(await readFile2(path2.join(destination, "release.json"), "utf8"));
  if (metadata.version !== state.version || metadata.build_id !== state.build_id)
    throw new Error("INSTALLATION_STATE_INVALID: binary metadata");
  const lines = (await readFile2(path2.join(destination, "SHA256SUMS"), "utf8")).trim().split(`
`);
  const checked = new Set;
  for (const line of lines) {
    const match = /^([a-f0-9]{64})  (.+)$/.exec(line);
    if (!match || match[2] === STATE || match[2] === "SHA256SUMS" || !expected.has(match[2]) || checked.has(match[2]) || sha256(await readFile2(path2.join(destination, match[2]))) !== match[1])
      throw new Error("INSTALLATION_MODIFIED: a package file has changed.");
    checked.add(match[2]);
  }
  if (checked.size !== expected.size - 2)
    throw new Error("INSTALLATION_STATE_INVALID: checksums");
  return state;
}
async function replaceState(directory, bytes) {
  const temporary = path2.join(directory, `.install-state-${randomUUID2()}`);
  try {
    await writeFile2(temporary, bytes, { mode: 384, flag: "wx" });
    await rename(temporary, path2.join(directory, STATE));
  } finally {
    await rm2(temporary, { force: true });
  }
}
function outside(destination, directory) {
  const relative = path2.relative(destination, directory);
  if (!relative || !relative.startsWith(`..${path2.sep}`) && relative !== ".." && !path2.isAbsolute(relative))
    throw new Error("DATA_DIRECTORY_INSIDE_SKILL");
}
function previousDirectory(destination, state) {
  const name = state?.previous?.directory;
  if (!name)
    return null;
  if (path2.basename(name) !== name || !name.startsWith(`.${path2.basename(destination)}.previous-`) || !/previous-[a-f0-9-]{36}$/.test(name))
    throw new Error("INSTALLATION_STATE_INVALID: previous directory");
  return path2.join(path2.dirname(destination), name);
}
async function findNpmCli() {
  const candidates = [process.env.npm_execpath, path2.join(path2.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js")];
  for (const directory of (process.env.PATH || "").split(path2.delimiter)) {
    candidates.push(path2.join(directory, "node_modules/npm/bin/npm-cli.js"));
    if (process.platform !== "win32")
      candidates.push(await realpath(path2.join(directory, "npm")).catch(() => null));
  }
  for (const file of candidates.filter(Boolean))
    if (file.endsWith("npm-cli.js") && await stat(file).then((s) => s.isFile(), () => false))
      return file;
  throw new Error("NPM_NOT_FOUND: install Node.js with npm using install.md.");
}
var defaultExecute = (program, args) => execFileSync(program, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 360000, maxBuffer: 4 * 1024 * 1024 });
async function prepareDriver(executable, driver, workspace, skipDependencies, execute) {
  const doctor = () => JSON.parse(execute(executable, ["doctor", "--driver-dir", driver, "--workspace", workspace]));
  try {
    if (doctor().status === "READY")
      return;
  } catch {}
  if (skipDependencies)
    throw new Error("DRIVER_NOT_READY: --skip-dependencies requires an already working driver.");
  await mkdir2(driver, { recursive: true, mode: 448 });
  const marker = path2.join(driver, ".ds160-driver-managed");
  const entries = await readdir(driver);
  if (entries.length && !entries.includes(".ds160-driver-managed"))
    throw new Error("DRIVER_DIRECTORY_NOT_MANAGED: repair it explicitly or choose a dedicated new directory.");
  await writeFile2(marker, `ds160-runtime
`, { mode: 384 });
  const npm = await findNpmCli();
  execute(process.execPath, [npm, "install", "--prefix", driver, "--save-exact", "--no-audit", "--no-fund", `playwright@${CONTRACT.playwright}`]);
  execute(process.execPath, [path2.join(driver, "node_modules/playwright/cli.js"), "install", "chromium"]);
  if (doctor().status !== "READY")
    throw new Error("DRIVER_NOT_READY");
}
async function install(manifest, options, { execute = defaultExecute, fetchBytes = download, platform = process.platform, arch = process.arch } = {}) {
  assertManifest(manifest, { allowLocal: Boolean(options.allowLocal), requireStable: !options.allowLocal });
  const target = `bun-${platform === "win32" ? "windows" : platform}-${arch}`;
  if (!Object.hasOwn(TARGETS, target) || !manifest.artifacts[target])
    throw new Error("PLATFORM_NOT_SUPPORTED");
  const destination = path2.resolve(options.destination);
  await mkdir2(path2.dirname(destination), { recursive: true });
  return withInstallationLock(destination, async () => {
    const old = await installedState(destination);
    if (old && old.target !== target)
      throw new Error("INSTALLATION_PLATFORM_MISMATCH");
    if (old && compareVersions(manifest.version, old.version) < 0 && !options.allowDowngrade)
      throw new Error("DOWNGRADE_REQUIRES_EXPLICIT_PERMISSION");
    const driver = path2.resolve(options.driver || old?.driver_dir || path2.join(path2.dirname(destination), "ds160-driver"));
    const workspace = path2.resolve(options.workspace || old?.workspace || path2.join(path2.dirname(destination), "ds160-workspace"));
    outside(destination, driver);
    outside(destination, workspace);
    const artifact = manifest.artifacts[target];
    if (old?.archive_sha256 === artifact.sha256 && old.driver_dir === driver && old.workspace === workspace) {
      await prepareDriver(path2.join(destination, artifact.executable), driver, workspace, options.skipDependencies, execute);
      return { status: "ALREADY_INSTALLED", version: old.version, destination, driver_dir: driver, workspace };
    }
    const files = inspectArchive(await fetchBytes(artifact.url, { allowLocal: options.allowLocal }), artifact, manifest);
    const staging = path2.join(path2.dirname(destination), `.${path2.basename(destination)}.staging-${randomUUID2()}`);
    const backup = path2.join(path2.dirname(destination), `.${path2.basename(destination)}.previous-${randomUUID2()}`);
    let movedOld = false;
    let activated = false;
    try {
      await mkdir2(staging, { mode: 448 });
      for (const [relative, bytes] of Object.entries(files)) {
        const file = path2.join(staging, relative);
        await mkdir2(path2.dirname(file), { recursive: true, mode: 448 });
        await writeFile2(file, bytes, { mode: relative === artifact.executable ? 493 : 420, flag: "wx" });
        if (relative === artifact.executable)
          await chmod(file, 493);
      }
      const executable = path2.join(staging, artifact.executable);
      const version = JSON.parse(execute(executable, ["version"]));
      if (version.version !== manifest.version || version.build_id !== artifact.build_id)
        throw new Error("BINARY_IDENTITY_MISMATCH");
      await prepareDriver(executable, driver, workspace, options.skipDependencies, execute);
      const state = {
        schema_version: 1,
        tool: "ds160-runtime",
        version: manifest.version,
        build_id: artifact.build_id,
        target,
        archive_sha256: artifact.sha256,
        profile_contract: manifest.profile_contract,
        driver_dir: driver,
        workspace,
        installed_at: new Date().toISOString(),
        previous: old ? { directory: path2.basename(backup), version: old.version } : null
      };
      await writeFile2(path2.join(staging, STATE), `${JSON.stringify(state, null, 2)}
`, { mode: 384, flag: "wx" });
      if (old) {
        const fresh = await installedState(destination);
        if (fresh.archive_sha256 !== old.archive_sha256)
          throw new Error("INSTALLATION_CHANGED");
        await rename(destination, backup);
        movedOld = true;
      }
      await rename(staging, destination);
      activated = true;
      const older = previousDirectory(destination, old);
      const warnings = [];
      if (older) {
        try {
          await installedState(older);
          await rm2(older, { recursive: true });
        } catch {
          warnings.push("PREVIOUS_COPY_PRESERVED: could not safely clean an older backup.");
        }
      }
      return { status: "INSTALLED", version: manifest.version, destination, driver_dir: driver, workspace, previous_version: old?.version, warnings };
    } catch (error) {
      if (movedOld && !activated)
        await rename(backup, destination);
      throw error;
    } finally {
      await rm2(staging, { recursive: true, force: true });
    }
  });
}
async function rollback(destination, { execute = defaultExecute } = {}) {
  destination = path2.resolve(destination);
  return withInstallationLock(destination, async () => {
    const current = await installedState(destination);
    const previous = previousDirectory(destination, current);
    if (!previous)
      throw new Error("ROLLBACK_NOT_AVAILABLE");
    const state = await installedState(previous);
    if (state.profile_contract !== current.profile_contract || state.target !== current.target)
      throw new Error("ROLLBACK_CONTRACT_INCOMPATIBLE");
    const executable = path2.join(previous, TARGETS[state.target].executable);
    if (JSON.parse(execute(executable, ["doctor", "--driver-dir", current.driver_dir, "--workspace", current.workspace])).status !== "READY")
      throw new Error("ROLLBACK_DRIVER_NOT_READY");
    const backup = path2.join(path2.dirname(destination), `.${path2.basename(destination)}.previous-${randomUUID2()}`);
    state.driver_dir = current.driver_dir;
    state.workspace = current.workspace;
    state.previous = { directory: path2.basename(backup), version: current.version };
    const originalState = await readFile2(path2.join(previous, STATE));
    await replaceState(previous, `${JSON.stringify(state, null, 2)}
`);
    let moved = false;
    try {
      await rename(destination, backup);
      moved = true;
      await rename(previous, destination);
    } catch (error) {
      if (moved)
        await rename(backup, destination);
      await replaceState(previous, originalState);
      throw error;
    }
    return { status: "ROLLED_BACK", version: state.version, destination };
  });
}
async function main(argv = process.argv.slice(2)) {
  if (Number(process.versions.node.split(".")[0]) < CONTRACT.minimum_node)
    throw new Error("NODE_VERSION_UNSUPPORTED: use Node.js 20 or newer.");
  const { values, tokens } = parseArgs({ args: argv, tokens: true, options: {
    dest: { type: "string" },
    "driver-dir": { type: "string" },
    workspace: { type: "string" },
    version: { type: "string" },
    "manifest-file": { type: "string" },
    "candidate-archive": { type: "string" },
    "skip-dependencies": { type: "boolean" },
    "allow-downgrade": { type: "boolean" },
    check: { type: "boolean" },
    rollback: { type: "boolean" },
    help: { type: "boolean" }
  } });
  const seen = new Set;
  for (const token of tokens)
    if (token.kind === "option") {
      if (seen.has(token.name))
        throw new Error(`INVALID_ARGUMENT: duplicate --${token.name}`);
      seen.add(token.name);
    }
  if (values.help) {
    console.log(`Usage: node install.mjs --dest <absolute-skill-directory> [--driver-dir <dir>] [--workspace <dir>] [--version <version> | --candidate-archive <trusted-local-zip> | --manifest-file <local-manifest>] [--check | --rollback]
--candidate-archive installs an explicitly trusted local candidate, not a stable release. --skip-dependencies requires a working existing driver.`);
    return;
  }
  for (const key of ["version", "manifest-file", "candidate-archive"]) {
    if (seen.has(key) && !values[key])
      throw new Error(`INVALID_ARGUMENT: empty --${key}`);
  }
  if (!values.dest || !path2.isAbsolute(values.dest))
    throw new Error("DESTINATION_REQUIRED: provide the absolute target Agent Skill directory.");
  if (values.rollback && (values.check || values.version || values["manifest-file"] || values["candidate-archive"]))
    throw new Error("INVALID_ARGUMENT: incompatible rollback options");
  if (values.rollback) {
    console.log(JSON.stringify(await rollback(values.dest)));
    return;
  }
  if (values.version && !validVersion(values.version))
    throw new Error("VERSION_INVALID");
  if ([values.version, values["manifest-file"], values["candidate-archive"]].filter(Boolean).length > 1)
    throw new Error("INVALID_ARGUMENT: choose one of version, manifest-file or candidate-archive");
  const candidate = values["candidate-archive"] ? await candidateFromArchive(values["candidate-archive"]) : null;
  const allowLocal = Boolean(values["manifest-file"] || candidate);
  const manifest = candidate?.manifest || (values["manifest-file"] ? JSON.parse(await download(pathToFileURL(path2.resolve(values["manifest-file"])).href, { allowLocal: true, limit: 1024 * 1024 })) : JSON.parse(await download(values.version ? `https://github.com/${DOWNLOAD_REPOSITORY}/releases/download/v${values.version}/manifest.json` : STABLE_URL, { limit: 1024 * 1024 })));
  assertManifest(manifest, { allowLocal, requireStable: !allowLocal });
  const target = `bun-${process.platform === "win32" ? "windows" : process.platform}-${process.arch}`;
  if (!Object.hasOwn(TARGETS, target) || !manifest.artifacts[target])
    throw new Error("PLATFORM_NOT_SUPPORTED");
  if (values.check) {
    const current = await installedState(path2.resolve(values.dest));
    const comparison = current ? compareVersions(manifest.version, current.version) : 1;
    console.log(JSON.stringify({
      status: "UPDATE_CHECKED",
      current: current?.version || null,
      available: manifest.version,
      update_available: comparison > 0 || comparison === 0 && current.archive_sha256 !== manifest.artifacts[target].sha256
    }));
    return;
  }
  console.log(JSON.stringify(await install(manifest, {
    destination: values.dest,
    driver: values["driver-dir"],
    workspace: values.workspace,
    skipDependencies: values["skip-dependencies"],
    allowDowngrade: values["allow-downgrade"],
    allowLocal
  }, candidate ? { fetchBytes: async () => candidate.bytes } : undefined)));
}

// delivery/installer-entry.mjs
try {
  await main();
} catch (error) {
  console.error(JSON.stringify({ status: "INSTALLATION_FAILED", error: error.message }));
  process.exitCode = 1;
}
