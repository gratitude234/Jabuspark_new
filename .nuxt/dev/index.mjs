import process from 'node:process';globalThis._importMeta_={url:import.meta.url,env:process.env};import { tmpdir } from 'node:os';
import { Server } from 'node:http';
import { resolve, dirname, join } from 'node:path';
import nodeCrypto, { randomUUID } from 'node:crypto';
import { parentPort, threadId } from 'node:worker_threads';
import { defineEventHandler, handleCacheHeaders, splitCookiesString, createEvent, fetchWithEvent, isEvent, eventHandler, setHeaders, sendRedirect, proxyRequest, getRequestHeader, setResponseHeaders, setResponseStatus, send, getRequestHeaders, setResponseHeader, appendResponseHeader, getRequestURL, getResponseHeader, removeResponseHeader, createError, getQuery as getQuery$1, readBody, createApp, createRouter as createRouter$1, toNodeListener, lazyEventHandler, getResponseStatus, getRouterParam, setCookie, getHeader, getResponseStatusText } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/h3/dist/index.mjs';
import { escapeHtml } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/@vue/shared/dist/shared.cjs.js';
import pdf from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/pdf-parse/index.js';
import { createClient } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/@supabase/supabase-js/dist/main/index.js';
import { createServerClient, parseCookieHeader } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/@supabase/ssr/dist/main/index.js';
import { createRenderer, getRequestDependencies, getPreloadLinks, getPrefetchLinks } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/vue-bundle-renderer/dist/runtime.mjs';
import { parseURL, withoutBase, joinURL, getQuery, withQuery, withTrailingSlash, decodePath, withLeadingSlash, withoutTrailingSlash, joinRelativeURL } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/ufo/dist/index.mjs';
import { renderToString } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/vue/server-renderer/index.mjs';
import { klona } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/klona/dist/index.mjs';
import defu, { defuFn } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/defu/dist/defu.mjs';
import destr, { destr as destr$1 } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/destr/dist/index.mjs';
import { snakeCase } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/scule/dist/index.mjs';
import { createHead as createHead$1, propsToString, renderSSRHead } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unhead/dist/server.mjs';
import { stringify, uneval } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/devalue/index.js';
import { isVNode, toValue, isRef } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/vue/index.mjs';
import { DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unhead/dist/plugins.mjs';
import { createHooks } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/hookable/dist/index.mjs';
import { createFetch, Headers as Headers$1 } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/ofetch/dist/node.mjs';
import { fetchNodeRequestHandler, callNodeRequestHandler } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/node-mock-http/dist/index.mjs';
import { createStorage, prefixStorage } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unstorage/dist/index.mjs';
import unstorage_47drivers_47fs from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unstorage/drivers/fs.mjs';
import { digest } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/ohash/dist/index.mjs';
import { toRouteMatcher, createRouter } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/radix3/dist/index.mjs';
import { readFile } from 'node:fs/promises';
import consola, { consola as consola$1 } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/consola/dist/index.mjs';
import { ErrorParser } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/youch-core/build/index.js';
import { Youch } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/nitropack/node_modules/youch/build/index.js';
import { SourceMapConsumer } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/source-map/source-map.js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { getContext } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unctx/dist/index.mjs';
import { captureRawStackTrace, parseRawStackTrace } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/errx/dist/index.js';
import { promises } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname as dirname$1, resolve as resolve$1 } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/pathe/dist/index.mjs';
import { walkResolver } from 'file://C:/Users/hp/Downloads/JabuSpark/node_modules/unhead/dist/utils.mjs';

const serverAssets = [{"baseName":"server","dir":"C:/Users/hp/Downloads/JabuSpark/server/assets"}];

const assets$1 = createStorage();

for (const asset of serverAssets) {
  assets$1.mount(asset.baseName, unstorage_47drivers_47fs({ base: asset.dir, ignore: (asset?.ignore || []) }));
}

const storage = createStorage({});

storage.mount('/assets', assets$1);

storage.mount('root', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/Downloads/JabuSpark","watchOptions":{"ignored":[null]}}));
storage.mount('src', unstorage_47drivers_47fs({"driver":"fs","readOnly":true,"base":"C:/Users/hp/Downloads/JabuSpark/server","watchOptions":{"ignored":[null]}}));
storage.mount('build', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/hp/Downloads/JabuSpark/.nuxt"}));
storage.mount('cache', unstorage_47drivers_47fs({"driver":"fs","readOnly":false,"base":"C:/Users/hp/Downloads/JabuSpark/.nuxt/cache"}));
storage.mount('data', unstorage_47drivers_47fs({"driver":"fs","base":"C:/Users/hp/Downloads/JabuSpark/.data/kv"}));

function useStorage(base = "") {
  return base ? prefixStorage(storage, base) : storage;
}

const Hasher = /* @__PURE__ */ (() => {
  class Hasher2 {
    buff = "";
    #context = /* @__PURE__ */ new Map();
    write(str) {
      this.buff += str;
    }
    dispatch(value) {
      const type = value === null ? "null" : typeof value;
      return this[type](value);
    }
    object(object) {
      if (object && typeof object.toJSON === "function") {
        return this.object(object.toJSON());
      }
      const objString = Object.prototype.toString.call(object);
      let objType = "";
      const objectLength = objString.length;
      objType = objectLength < 10 ? "unknown:[" + objString + "]" : objString.slice(8, objectLength - 1);
      objType = objType.toLowerCase();
      let objectNumber = null;
      if ((objectNumber = this.#context.get(object)) === void 0) {
        this.#context.set(object, this.#context.size);
      } else {
        return this.dispatch("[CIRCULAR:" + objectNumber + "]");
      }
      if (typeof Buffer !== "undefined" && Buffer.isBuffer && Buffer.isBuffer(object)) {
        this.write("buffer:");
        return this.write(object.toString("utf8"));
      }
      if (objType !== "object" && objType !== "function" && objType !== "asyncfunction") {
        if (this[objType]) {
          this[objType](object);
        } else {
          this.unknown(object, objType);
        }
      } else {
        const keys = Object.keys(object).sort();
        const extraKeys = [];
        this.write("object:" + (keys.length + extraKeys.length) + ":");
        const dispatchForKey = (key) => {
          this.dispatch(key);
          this.write(":");
          this.dispatch(object[key]);
          this.write(",");
        };
        for (const key of keys) {
          dispatchForKey(key);
        }
        for (const key of extraKeys) {
          dispatchForKey(key);
        }
      }
    }
    array(arr, unordered) {
      unordered = unordered === void 0 ? false : unordered;
      this.write("array:" + arr.length + ":");
      if (!unordered || arr.length <= 1) {
        for (const entry of arr) {
          this.dispatch(entry);
        }
        return;
      }
      const contextAdditions = /* @__PURE__ */ new Map();
      const entries = arr.map((entry) => {
        const hasher = new Hasher2();
        hasher.dispatch(entry);
        for (const [key, value] of hasher.#context) {
          contextAdditions.set(key, value);
        }
        return hasher.toString();
      });
      this.#context = contextAdditions;
      entries.sort();
      return this.array(entries, false);
    }
    date(date) {
      return this.write("date:" + date.toJSON());
    }
    symbol(sym) {
      return this.write("symbol:" + sym.toString());
    }
    unknown(value, type) {
      this.write(type);
      if (!value) {
        return;
      }
      this.write(":");
      if (value && typeof value.entries === "function") {
        return this.array(
          [...value.entries()],
          true
          /* ordered */
        );
      }
    }
    error(err) {
      return this.write("error:" + err.toString());
    }
    boolean(bool) {
      return this.write("bool:" + bool);
    }
    string(string) {
      this.write("string:" + string.length + ":");
      this.write(string);
    }
    function(fn) {
      this.write("fn:");
      if (isNativeFunction(fn)) {
        this.dispatch("[native]");
      } else {
        this.dispatch(fn.toString());
      }
    }
    number(number) {
      return this.write("number:" + number);
    }
    null() {
      return this.write("Null");
    }
    undefined() {
      return this.write("Undefined");
    }
    regexp(regex) {
      return this.write("regex:" + regex.toString());
    }
    arraybuffer(arr) {
      this.write("arraybuffer:");
      return this.dispatch(new Uint8Array(arr));
    }
    url(url) {
      return this.write("url:" + url.toString());
    }
    map(map) {
      this.write("map:");
      const arr = [...map];
      return this.array(arr, false);
    }
    set(set) {
      this.write("set:");
      const arr = [...set];
      return this.array(arr, false);
    }
    bigint(number) {
      return this.write("bigint:" + number.toString());
    }
  }
  for (const type of [
    "uint8array",
    "uint8clampedarray",
    "unt8array",
    "uint16array",
    "unt16array",
    "uint32array",
    "unt32array",
    "float32array",
    "float64array"
  ]) {
    Hasher2.prototype[type] = function(arr) {
      this.write(type + ":");
      return this.array([...arr], false);
    };
  }
  function isNativeFunction(f) {
    if (typeof f !== "function") {
      return false;
    }
    return Function.prototype.toString.call(f).slice(
      -15
      /* "[native code] }".length */
    ) === "[native code] }";
  }
  return Hasher2;
})();
function serialize(object) {
  const hasher = new Hasher();
  hasher.dispatch(object);
  return hasher.buff;
}
function hash(value) {
  return digest(typeof value === "string" ? value : serialize(value)).replace(/[-_]/g, "").slice(0, 10);
}

function defaultCacheOptions() {
  return {
    name: "_",
    base: "/cache",
    swr: true,
    maxAge: 1
  };
}
function defineCachedFunction(fn, opts = {}) {
  opts = { ...defaultCacheOptions(), ...opts };
  const pending = {};
  const group = opts.group || "nitro/functions";
  const name = opts.name || fn.name || "_";
  const integrity = opts.integrity || hash([fn, opts]);
  const validate = opts.validate || ((entry) => entry.value !== void 0);
  async function get(key, resolver, shouldInvalidateCache, event) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    let entry = await useStorage().getItem(cacheKey).catch((error) => {
      console.error(`[cache] Cache read error.`, error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }) || {};
    if (typeof entry !== "object") {
      entry = {};
      const error = new Error("Malformed data read from cache.");
      console.error("[cache]", error);
      useNitroApp().captureError(error, { event, tags: ["cache"] });
    }
    const ttl = (opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = shouldInvalidateCache || entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl || validate(entry) === false;
    const _resolve = async () => {
      const isPending = pending[key];
      if (!isPending) {
        if (entry.value !== void 0 && (opts.staleMaxAge || 0) >= 0 && opts.swr === false) {
          entry.value = void 0;
          entry.integrity = void 0;
          entry.mtime = void 0;
          entry.expires = void 0;
        }
        pending[key] = Promise.resolve(resolver());
      }
      try {
        entry.value = await pending[key];
      } catch (error) {
        if (!isPending) {
          delete pending[key];
        }
        throw error;
      }
      if (!isPending) {
        entry.mtime = Date.now();
        entry.integrity = integrity;
        delete pending[key];
        if (validate(entry) !== false) {
          let setOpts;
          if (opts.maxAge && !opts.swr) {
            setOpts = { ttl: opts.maxAge };
          }
          const promise = useStorage().setItem(cacheKey, entry, setOpts).catch((error) => {
            console.error(`[cache] Cache write error.`, error);
            useNitroApp().captureError(error, { event, tags: ["cache"] });
          });
          if (event?.waitUntil) {
            event.waitUntil(promise);
          }
        }
      }
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (entry.value === void 0) {
      await _resolvePromise;
    } else if (expired && event && event.waitUntil) {
      event.waitUntil(_resolvePromise);
    }
    if (opts.swr && validate(entry) !== false) {
      _resolvePromise.catch((error) => {
        console.error(`[cache] SWR handler error.`, error);
        useNitroApp().captureError(error, { event, tags: ["cache"] });
      });
      return entry;
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const shouldBypassCache = await opts.shouldBypassCache?.(...args);
    if (shouldBypassCache) {
      return fn(...args);
    }
    const key = await (opts.getKey || getKey)(...args);
    const shouldInvalidateCache = await opts.shouldInvalidateCache?.(...args);
    const entry = await get(
      key,
      () => fn(...args),
      shouldInvalidateCache,
      args[0] && isEvent(args[0]) ? args[0] : void 0
    );
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
function cachedFunction(fn, opts = {}) {
  return defineCachedFunction(fn, opts);
}
function getKey(...args) {
  return args.length > 0 ? hash(args) : "";
}
function escapeKey(key) {
  return String(key).replace(/\W/g, "");
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions()) {
  const variableHeaderNames = (opts.varies || []).filter(Boolean).map((h) => h.toLowerCase()).sort();
  const _opts = {
    ...opts,
    getKey: async (event) => {
      const customKey = await opts.getKey?.(event);
      if (customKey) {
        return escapeKey(customKey);
      }
      const _path = event.node.req.originalUrl || event.node.req.url || event.path;
      let _pathname;
      try {
        _pathname = escapeKey(decodeURI(parseURL(_path).pathname)).slice(0, 16) || "index";
      } catch {
        _pathname = "-";
      }
      const _hashedPath = `${_pathname}.${hash(_path)}`;
      const _headers = variableHeaderNames.map((header) => [header, event.node.req.headers[header]]).map(([name, value]) => `${escapeKey(name)}.${hash(value)}`);
      return [_hashedPath, ..._headers].join(":");
    },
    validate: (entry) => {
      if (!entry.value) {
        return false;
      }
      if (entry.value.code >= 400) {
        return false;
      }
      if (entry.value.body === void 0) {
        return false;
      }
      if (entry.value.headers.etag === "undefined" || entry.value.headers["last-modified"] === "undefined") {
        return false;
      }
      return true;
    },
    group: opts.group || "nitro/handlers",
    integrity: opts.integrity || hash([handler, opts])
  };
  const _cachedHandler = cachedFunction(
    async (incomingEvent) => {
      const variableHeaders = {};
      for (const header of variableHeaderNames) {
        const value = incomingEvent.node.req.headers[header];
        if (value !== void 0) {
          variableHeaders[header] = value;
        }
      }
      const reqProxy = cloneWithProxy(incomingEvent.node.req, {
        headers: variableHeaders
      });
      const resHeaders = {};
      let _resSendBody;
      const resProxy = cloneWithProxy(incomingEvent.node.res, {
        statusCode: 200,
        writableEnded: false,
        writableFinished: false,
        headersSent: false,
        closed: false,
        getHeader(name) {
          return resHeaders[name];
        },
        setHeader(name, value) {
          resHeaders[name] = value;
          return this;
        },
        getHeaderNames() {
          return Object.keys(resHeaders);
        },
        hasHeader(name) {
          return name in resHeaders;
        },
        removeHeader(name) {
          delete resHeaders[name];
        },
        getHeaders() {
          return resHeaders;
        },
        end(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2();
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return this;
        },
        write(chunk, arg2, arg3) {
          if (typeof chunk === "string") {
            _resSendBody = chunk;
          }
          if (typeof arg2 === "function") {
            arg2(void 0);
          }
          if (typeof arg3 === "function") {
            arg3();
          }
          return true;
        },
        writeHead(statusCode, headers2) {
          this.statusCode = statusCode;
          if (headers2) {
            if (Array.isArray(headers2) || typeof headers2 === "string") {
              throw new TypeError("Raw headers  is not supported.");
            }
            for (const header in headers2) {
              const value = headers2[header];
              if (value !== void 0) {
                this.setHeader(
                  header,
                  value
                );
              }
            }
          }
          return this;
        }
      });
      const event = createEvent(reqProxy, resProxy);
      event.fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: useNitroApp().localFetch
      });
      event.$fetch = (url, fetchOptions) => fetchWithEvent(event, url, fetchOptions, {
        fetch: globalThis.$fetch
      });
      event.waitUntil = incomingEvent.waitUntil;
      event.context = incomingEvent.context;
      event.context.cache = {
        options: _opts
      };
      const body = await handler(event) || _resSendBody;
      const headers = event.node.res.getHeaders();
      headers.etag = String(
        headers.Etag || headers.etag || `W/"${hash(body)}"`
      );
      headers["last-modified"] = String(
        headers["Last-Modified"] || headers["last-modified"] || (/* @__PURE__ */ new Date()).toUTCString()
      );
      const cacheControl = [];
      if (opts.swr) {
        if (opts.maxAge) {
          cacheControl.push(`s-maxage=${opts.maxAge}`);
        }
        if (opts.staleMaxAge) {
          cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
        } else {
          cacheControl.push("stale-while-revalidate");
        }
      } else if (opts.maxAge) {
        cacheControl.push(`max-age=${opts.maxAge}`);
      }
      if (cacheControl.length > 0) {
        headers["cache-control"] = cacheControl.join(", ");
      }
      const cacheEntry = {
        code: event.node.res.statusCode,
        headers,
        body
      };
      return cacheEntry;
    },
    _opts
  );
  return defineEventHandler(async (event) => {
    if (opts.headersOnly) {
      if (handleCacheHeaders(event, { maxAge: opts.maxAge })) {
        return;
      }
      return handler(event);
    }
    const response = await _cachedHandler(
      event
    );
    if (event.node.res.headersSent || event.node.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["last-modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.node.res.statusCode = response.code;
    for (const name in response.headers) {
      const value = response.headers[name];
      if (name === "set-cookie") {
        event.node.res.appendHeader(
          name,
          splitCookiesString(value)
        );
      } else {
        if (value !== void 0) {
          event.node.res.setHeader(name, value);
        }
      }
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const inlineAppConfig = {
  "nuxt": {}
};



const appConfig = defuFn(inlineAppConfig);

function getEnv(key, opts) {
  const envKey = snakeCase(key).toUpperCase();
  return destr(
    process.env[opts.prefix + envKey] ?? process.env[opts.altPrefix + envKey]
  );
}
function _isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function applyEnv(obj, opts, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey, opts);
    if (_isObject(obj[key])) {
      if (_isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
        applyEnv(obj[key], opts, subKey);
      } else if (envValue === void 0) {
        applyEnv(obj[key], opts, subKey);
      } else {
        obj[key] = envValue ?? obj[key];
      }
    } else {
      obj[key] = envValue ?? obj[key];
    }
    if (opts.envExpansion && typeof obj[key] === "string") {
      obj[key] = _expandFromEnv(obj[key]);
    }
  }
  return obj;
}
const envExpandRx = /\{\{([^{}]*)\}\}/g;
function _expandFromEnv(value) {
  return value.replace(envExpandRx, (match, key) => {
    return process.env[key] || match;
  });
}

const _inlineRuntimeConfig = {
  "app": {
    "baseURL": "/",
    "buildId": "dev",
    "buildAssetsDir": "/_nuxt/",
    "cdnURL": ""
  },
  "nitro": {
    "envPrefix": "NUXT_",
    "routeRules": {
      "/__nuxt_error": {
        "cache": false
      },
      "/me": {
        "ssr": false
      },
      "/_nuxt/builds/meta/**": {
        "headers": {
          "cache-control": "public, max-age=31536000, immutable"
        }
      },
      "/_nuxt/builds/**": {
        "headers": {
          "cache-control": "public, max-age=1, immutable"
        }
      }
    }
  },
  "public": {
    "supabaseUrl": "https://cfixqyjbwssvlxoezthm.supabase.co",
    "supabaseKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaXhxeWpid3Nzdmx4b2V6dGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTA2OTEsImV4cCI6MjA3ODU2NjY5MX0.t1qI0X8GCF7MPE5lLYH2_ADDlmRZLKHO9CADsItXlEI",
    "embeddingProvider": "gemini",
    "supabase": {
      "url": "https://cfixqyjbwssvlxoezthm.supabase.co",
      "key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaXhxeWpid3Nzdmx4b2V6dGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5OTA2OTEsImV4cCI6MjA3ODU2NjY5MX0.t1qI0X8GCF7MPE5lLYH2_ADDlmRZLKHO9CADsItXlEI",
      "redirect": true,
      "redirectOptions": {
        "login": "/me",
        "callback": "/me",
        "exclude": [
          "/",
          "/ask",
          "/drill",
          "/library",
          "/reader/**"
        ],
        "cookieRedirect": false,
        "saveRedirectToCookie": false
      },
      "cookieName": "sb",
      "cookiePrefix": "sb-cfixqyjbwssvlxoezthm-auth-token",
      "useSsrCookies": true,
      "cookieOptions": {
        "maxAge": 28800,
        "sameSite": "lax",
        "secure": true
      },
      "clientOptions": {}
    }
  },
  "supabaseServiceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaXhxeWpid3Nzdmx4b2V6dGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDY5MSwiZXhwIjoyMDc4NTY2NjkxfQ.cNki_zL4VxMLXTyCAo0WIPk7metq-JJ-7ZRni2zGSW0",
  "geminiApiKey": "AIzaSyDRIuoKi3v3xfSZhGlpcuxBL77YkAagUiA",
  "geminiModelText": "models/gemini-2.5-pro",
  "geminiModelEmbedding": "models/text-embedding-004",
  "geminiDisabled": false,
  "supabase": {
    "serviceKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmaXhxeWpid3Nzdmx4b2V6dGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjk5MDY5MSwiZXhwIjoyMDc4NTY2NjkxfQ.cNki_zL4VxMLXTyCAo0WIPk7metq-JJ-7ZRni2zGSW0"
  }
};
const envOptions = {
  prefix: "NITRO_",
  altPrefix: _inlineRuntimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_",
  envExpansion: _inlineRuntimeConfig.nitro.envExpansion ?? process.env.NITRO_ENV_EXPANSION ?? false
};
const _sharedRuntimeConfig = _deepFreeze(
  applyEnv(klona(_inlineRuntimeConfig), envOptions)
);
function useRuntimeConfig(event) {
  if (!event) {
    return _sharedRuntimeConfig;
  }
  if (event.context.nitro.runtimeConfig) {
    return event.context.nitro.runtimeConfig;
  }
  const runtimeConfig = klona(_inlineRuntimeConfig);
  applyEnv(runtimeConfig, envOptions);
  event.context.nitro.runtimeConfig = runtimeConfig;
  return runtimeConfig;
}
_deepFreeze(klona(appConfig));
function _deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      _deepFreeze(value);
    }
  }
  return Object.freeze(object);
}
new Proxy(/* @__PURE__ */ Object.create(null), {
  get: (_, prop) => {
    console.warn(
      "Please use `useRuntimeConfig()` instead of accessing config directly."
    );
    const runtimeConfig = useRuntimeConfig();
    if (prop in runtimeConfig) {
      return runtimeConfig[prop];
    }
    return void 0;
  }
});

const config = useRuntimeConfig();
const _routeRulesMatcher = toRouteMatcher(
  createRouter({ routes: config.nitro.routeRules })
);
function createRouteRulesHandler(ctx) {
  return eventHandler((event) => {
    const routeRules = getRouteRules(event);
    if (routeRules.headers) {
      setHeaders(event, routeRules.headers);
    }
    if (routeRules.redirect) {
      let target = routeRules.redirect.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.redirect._redirectStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return sendRedirect(event, target, routeRules.redirect.statusCode);
    }
    if (routeRules.proxy) {
      let target = routeRules.proxy.to;
      if (target.endsWith("/**")) {
        let targetPath = event.path;
        const strpBase = routeRules.proxy._proxyStripBase;
        if (strpBase) {
          targetPath = withoutBase(targetPath, strpBase);
        }
        target = joinURL(target.slice(0, -3), targetPath);
      } else if (event.path.includes("?")) {
        const query = getQuery(event.path);
        target = withQuery(target, query);
      }
      return proxyRequest(event, target, {
        fetch: ctx.localFetch,
        ...routeRules.proxy
      });
    }
  });
}
function getRouteRules(event) {
  event.context._nitro = event.context._nitro || {};
  if (!event.context._nitro.routeRules) {
    event.context._nitro.routeRules = getRouteRulesForPath(
      withoutBase(event.path.split("?")[0], useRuntimeConfig().app.baseURL)
    );
  }
  return event.context._nitro.routeRules;
}
function getRouteRulesForPath(path) {
  return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
}

function _captureError(error, type) {
  console.error(`[${type}]`, error);
  useNitroApp().captureError(error, { tags: [type] });
}
function trapUnhandledNodeErrors() {
  process.on(
    "unhandledRejection",
    (error) => _captureError(error, "unhandledRejection")
  );
  process.on(
    "uncaughtException",
    (error) => _captureError(error, "uncaughtException")
  );
}
function joinHeaders(value) {
  return Array.isArray(value) ? value.join(", ") : String(value);
}
function normalizeFetchResponse(response) {
  if (!response.headers.has("set-cookie")) {
    return response;
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: normalizeCookieHeaders(response.headers)
  });
}
function normalizeCookieHeader(header = "") {
  return splitCookiesString(joinHeaders(header));
}
function normalizeCookieHeaders(headers) {
  const outgoingHeaders = new Headers();
  for (const [name, header] of headers) {
    if (name === "set-cookie") {
      for (const cookie of normalizeCookieHeader(header)) {
        outgoingHeaders.append("set-cookie", cookie);
      }
    } else {
      outgoingHeaders.set(name, joinHeaders(header));
    }
  }
  return outgoingHeaders;
}

function isJsonRequest(event) {
  if (hasReqHeader(event, "accept", "text/html")) {
    return false;
  }
  return hasReqHeader(event, "accept", "application/json") || hasReqHeader(event, "user-agent", "curl/") || hasReqHeader(event, "user-agent", "httpie/") || hasReqHeader(event, "sec-fetch-mode", "cors") || event.path.startsWith("/api/") || event.path.endsWith(".json");
}
function hasReqHeader(event, name, includes) {
  const value = getRequestHeader(event, name);
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}

const errorHandler$0 = (async function errorhandler(error, event, { defaultHandler }) {
  if (event.handled || isJsonRequest(event)) {
    return;
  }
  const defaultRes = await defaultHandler(error, event, { json: true });
  const statusCode = error.statusCode || 500;
  if (statusCode === 404 && defaultRes.status === 302) {
    setResponseHeaders(event, defaultRes.headers);
    setResponseStatus(event, defaultRes.status, defaultRes.statusText);
    return send(event, JSON.stringify(defaultRes.body, null, 2));
  }
  if (typeof defaultRes.body !== "string" && Array.isArray(defaultRes.body.stack)) {
    defaultRes.body.stack = defaultRes.body.stack.join("\n");
  }
  const errorObject = defaultRes.body;
  const url = new URL(errorObject.url);
  errorObject.url = withoutBase(url.pathname, useRuntimeConfig(event).app.baseURL) + url.search + url.hash;
  errorObject.message ||= "Server Error";
  errorObject.data ||= error.data;
  errorObject.statusMessage ||= error.statusMessage;
  delete defaultRes.headers["content-type"];
  delete defaultRes.headers["content-security-policy"];
  setResponseHeaders(event, defaultRes.headers);
  const reqHeaders = getRequestHeaders(event);
  const isRenderingError = event.path.startsWith("/__nuxt_error") || !!reqHeaders["x-nuxt-error"];
  const res = isRenderingError ? null : await useNitroApp().localFetch(
    withQuery(joinURL(useRuntimeConfig(event).app.baseURL, "/__nuxt_error"), errorObject),
    {
      headers: { ...reqHeaders, "x-nuxt-error": "true" },
      redirect: "manual"
    }
  ).catch(() => null);
  if (event.handled) {
    return;
  }
  if (!res) {
    const { template } = await Promise.resolve().then(function () { return errorDev; }) ;
    {
      errorObject.description = errorObject.message;
    }
    setResponseHeader(event, "Content-Type", "text/html;charset=UTF-8");
    return send(event, template(errorObject));
  }
  const html = await res.text();
  for (const [header, value] of res.headers.entries()) {
    if (header === "set-cookie") {
      appendResponseHeader(event, header, value);
      continue;
    }
    setResponseHeader(event, header, value);
  }
  setResponseStatus(event, res.status && res.status !== 200 ? res.status : defaultRes.status, res.statusText || defaultRes.statusText);
  return send(event, html);
});

function defineNitroErrorHandler(handler) {
  return handler;
}

const errorHandler$1 = defineNitroErrorHandler(
  async function defaultNitroErrorHandler(error, event) {
    const res = await defaultHandler(error, event);
    if (!event.node?.res.headersSent) {
      setResponseHeaders(event, res.headers);
    }
    setResponseStatus(event, res.status, res.statusText);
    return send(
      event,
      typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2)
    );
  }
);
async function defaultHandler(error, event, opts) {
  const isSensitive = error.unhandled || error.fatal;
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage || "Server Error";
  const url = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true });
  if (statusCode === 404) {
    const baseURL = "/";
    if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) {
      const redirectTo = `${baseURL}${url.pathname.slice(1)}${url.search}`;
      return {
        status: 302,
        statusText: "Found",
        headers: { location: redirectTo },
        body: `Redirecting...`
      };
    }
  }
  await loadStackTrace(error).catch(consola.error);
  const youch = new Youch();
  if (isSensitive && !opts?.silent) {
    const tags = [error.unhandled && "[unhandled]", error.fatal && "[fatal]"].filter(Boolean).join(" ");
    const ansiError = await (await youch.toANSI(error)).replaceAll(process.cwd(), ".");
    consola.error(
      `[request error] ${tags} [${event.method}] ${url}

`,
      ansiError
    );
  }
  const useJSON = opts?.json || !getRequestHeader(event, "accept")?.includes("text/html");
  const headers = {
    "content-type": useJSON ? "application/json" : "text/html",
    // Prevent browser from guessing the MIME types of resources.
    "x-content-type-options": "nosniff",
    // Prevent error page from being embedded in an iframe
    "x-frame-options": "DENY",
    // Prevent browsers from sending the Referer header
    "referrer-policy": "no-referrer",
    // Disable the execution of any js
    "content-security-policy": "script-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'self';"
  };
  if (statusCode === 404 || !getResponseHeader(event, "cache-control")) {
    headers["cache-control"] = "no-cache";
  }
  const body = useJSON ? {
    error: true,
    url,
    statusCode,
    statusMessage,
    message: error.message,
    data: error.data,
    stack: error.stack?.split("\n").map((line) => line.trim())
  } : await youch.toHTML(error, {
    request: {
      url: url.href,
      method: event.method,
      headers: getRequestHeaders(event)
    }
  });
  return {
    status: statusCode,
    statusText: statusMessage,
    headers,
    body
  };
}
async function loadStackTrace(error) {
  if (!(error instanceof Error)) {
    return;
  }
  const parsed = await new ErrorParser().defineSourceLoader(sourceLoader).parse(error);
  const stack = error.message + "\n" + parsed.frames.map((frame) => fmtFrame(frame)).join("\n");
  Object.defineProperty(error, "stack", { value: stack });
  if (error.cause) {
    await loadStackTrace(error.cause).catch(consola.error);
  }
}
async function sourceLoader(frame) {
  if (!frame.fileName || frame.fileType !== "fs" || frame.type === "native") {
    return;
  }
  if (frame.type === "app") {
    const rawSourceMap = await readFile(`${frame.fileName}.map`, "utf8").catch(() => {
    });
    if (rawSourceMap) {
      const consumer = await new SourceMapConsumer(rawSourceMap);
      const originalPosition = consumer.originalPositionFor({ line: frame.lineNumber, column: frame.columnNumber });
      if (originalPosition.source && originalPosition.line) {
        frame.fileName = resolve(dirname(frame.fileName), originalPosition.source);
        frame.lineNumber = originalPosition.line;
        frame.columnNumber = originalPosition.column || 0;
      }
    }
  }
  const contents = await readFile(frame.fileName, "utf8").catch(() => {
  });
  return contents ? { contents } : void 0;
}
function fmtFrame(frame) {
  if (frame.type === "native") {
    return frame.raw;
  }
  const src = `${frame.fileName || ""}:${frame.lineNumber}:${frame.columnNumber})`;
  return frame.functionName ? `at ${frame.functionName} (${src}` : `at ${src}`;
}

const errorHandlers = [errorHandler$0, errorHandler$1];

async function errorHandler(error, event) {
  for (const handler of errorHandlers) {
    try {
      await handler(error, event, { defaultHandler });
      if (event.handled) {
        return; // Response handled
      }
    } catch(error) {
      // Handler itself thrown, log and continue
      console.error(error);
    }
  }
  // H3 will handle fallback
}

const script = `
if (!window.__NUXT_DEVTOOLS_TIME_METRIC__) {
  Object.defineProperty(window, '__NUXT_DEVTOOLS_TIME_METRIC__', {
    value: {},
    enumerable: false,
    configurable: true,
  })
}
window.__NUXT_DEVTOOLS_TIME_METRIC__.appInit = Date.now()
`;

const _KyPJxtZ8hN80uADY0Qy6tq6R9LL0DAw6JWqGF_FgRg = (function(nitro) {
  nitro.hooks.hook("render:html", (htmlContext) => {
    htmlContext.head.push(`<script>${script}<\/script>`);
  });
});

const rootDir = "C:/Users/hp/Downloads/JabuSpark";

const appHead = {"meta":[{"charset":"utf-8"},{"name":"theme-color","content":"#0f172a"},{"name":"viewport","content":"width=device-width, initial-scale=1"}],"link":[{"rel":"manifest","href":"/manifest.webmanifest"},{"rel":"icon","type":"image/png","sizes":"192x192","href":"/icons/icon-192.png"},{"rel":"icon","type":"image/png","sizes":"512x512","href":"/icons/icon-512.png"}],"style":[],"script":[],"noscript":[],"title":"JabuSpark"};

const appRootTag = "div";

const appRootAttrs = {"id":"__nuxt"};

const appTeleportTag = "div";

const appTeleportAttrs = {"id":"teleports"};

const appId = "nuxt-app";

const devReducers = {
  VNode: (data) => isVNode(data) ? { type: data.type, props: data.props } : void 0,
  URL: (data) => data instanceof URL ? data.toString() : void 0
};
const asyncContext = getContext("nuxt-dev", { asyncContext: true, AsyncLocalStorage });
const _6D5zT291OWWh9OeMZ2774KRfl7ksAPw6u68dqDJvFpc = (nitroApp) => {
  const handler = nitroApp.h3App.handler;
  nitroApp.h3App.handler = (event) => {
    return asyncContext.callAsync({ logs: [], event }, () => handler(event));
  };
  onConsoleLog((_log) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    const rawStack = captureRawStackTrace();
    if (!rawStack || rawStack.includes("runtime/vite-node.mjs")) {
      return;
    }
    const trace = [];
    let filename = "";
    for (const entry of parseRawStackTrace(rawStack)) {
      if (entry.source === import.meta.url) {
        continue;
      }
      if (EXCLUDE_TRACE_RE.test(entry.source)) {
        continue;
      }
      filename ||= entry.source.replace(withTrailingSlash(rootDir), "");
      trace.push({
        ...entry,
        source: entry.source.startsWith("file://") ? entry.source.replace("file://", "") : entry.source
      });
    }
    const log = {
      ..._log,
      // Pass along filename to allow the client to display more info about where log comes from
      filename,
      // Clean up file names in stack trace
      stack: trace
    };
    ctx.logs.push(log);
  });
  nitroApp.hooks.hook("afterResponse", () => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    return nitroApp.hooks.callHook("dev:ssr-logs", { logs: ctx.logs, path: ctx.event.path });
  });
  nitroApp.hooks.hook("render:html", (htmlContext) => {
    const ctx = asyncContext.tryUse();
    if (!ctx) {
      return;
    }
    try {
      const reducers = Object.assign(/* @__PURE__ */ Object.create(null), devReducers, ctx.event.context._payloadReducers);
      htmlContext.bodyAppend.unshift(`<script type="application/json" data-nuxt-logs="${appId}">${stringify(ctx.logs, reducers)}<\/script>`);
    } catch (e) {
      const shortError = e instanceof Error && "toString" in e ? ` Received \`${e.toString()}\`.` : "";
      console.warn(`[nuxt] Failed to stringify dev server logs.${shortError} You can define your own reducer/reviver for rich types following the instructions in https://nuxt.com/docs/api/composables/use-nuxt-app#payload.`);
    }
  });
};
const EXCLUDE_TRACE_RE = /\/node_modules\/(?:.*\/)?(?:nuxt|nuxt-nightly|nuxt-edge|nuxt3|consola|@vue)\/|core\/runtime\/nitro/;
function onConsoleLog(callback) {
  consola$1.addReporter({
    log(logObj) {
      callback(logObj);
    }
  });
  consola$1.wrapConsole();
}

const plugins = [
  _KyPJxtZ8hN80uADY0Qy6tq6R9LL0DAw6JWqGF_FgRg,
_6D5zT291OWWh9OeMZ2774KRfl7ksAPw6u68dqDJvFpc
];

const assets = {};

function readAsset (id) {
  const serverDir = dirname$1(fileURLToPath(import.meta.url));
  return promises.readFile(resolve$1(serverDir, assets[id].path))
}

const publicAssetBases = {"/_nuxt/builds/meta/":{"maxAge":31536000},"/_nuxt/builds/":{"maxAge":1}};

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
const EncodingMap = { gzip: ".gz", br: ".br" };
const _1Rwqns = eventHandler((event) => {
  if (event.method && !METHODS.has(event.method)) {
    return;
  }
  let id = decodePath(
    withLeadingSlash(withoutTrailingSlash(parseURL(event.path).pathname))
  );
  let asset;
  const encodingHeader = String(
    getRequestHeader(event, "accept-encoding") || ""
  );
  const encodings = [
    ...encodingHeader.split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(),
    ""
  ];
  if (encodings.length > 1) {
    appendResponseHeader(event, "Vary", "Accept-Encoding");
  }
  for (const encoding of encodings) {
    for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
      const _asset = getAsset(_id);
      if (_asset) {
        asset = _asset;
        id = _id;
        break;
      }
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      removeResponseHeader(event, "Cache-Control");
      throw createError({ statusCode: 404 });
    }
    return;
  }
  const ifNotMatch = getRequestHeader(event, "if-none-match") === asset.etag;
  if (ifNotMatch) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  const ifModifiedSinceH = getRequestHeader(event, "if-modified-since");
  const mtimeDate = new Date(asset.mtime);
  if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
    setResponseStatus(event, 304, "Not Modified");
    return "";
  }
  if (asset.type && !getResponseHeader(event, "Content-Type")) {
    setResponseHeader(event, "Content-Type", asset.type);
  }
  if (asset.etag && !getResponseHeader(event, "ETag")) {
    setResponseHeader(event, "ETag", asset.etag);
  }
  if (asset.mtime && !getResponseHeader(event, "Last-Modified")) {
    setResponseHeader(event, "Last-Modified", mtimeDate.toUTCString());
  }
  if (asset.encoding && !getResponseHeader(event, "Content-Encoding")) {
    setResponseHeader(event, "Content-Encoding", asset.encoding);
  }
  if (asset.size > 0 && !getResponseHeader(event, "Content-Length")) {
    setResponseHeader(event, "Content-Length", asset.size);
  }
  return readAsset(id);
});

const VueResolver = (_, value) => {
  return isRef(value) ? toValue(value) : value;
};

const headSymbol = "usehead";
// @__NO_SIDE_EFFECTS__
function vueInstall(head) {
  const plugin = {
    install(app) {
      app.config.globalProperties.$unhead = head;
      app.config.globalProperties.$head = head;
      app.provide(headSymbol, head);
    }
  };
  return plugin.install;
}

// @__NO_SIDE_EFFECTS__
function resolveUnrefHeadInput(input) {
  return walkResolver(input, VueResolver);
}

// @__NO_SIDE_EFFECTS__
function createHead(options = {}) {
  const head = createHead$1({
    ...options,
    propResolvers: [VueResolver]
  });
  head.install = vueInstall(head);
  return head;
}

const unheadOptions = {
  disableDefaults: true,
  disableCapoSorting: false,
  plugins: [DeprecationsPlugin, PromisesPlugin, TemplateParamsPlugin, AliasSortingPlugin],
};

function createSSRContext(event) {
  const ssrContext = {
    url: event.path,
    event,
    runtimeConfig: useRuntimeConfig(event),
    noSSR: event.context.nuxt?.noSSR || (false),
    head: createHead(unheadOptions),
    error: false,
    nuxt: void 0,
    /* NuxtApp */
    payload: {},
    _payloadReducers: /* @__PURE__ */ Object.create(null),
    modules: /* @__PURE__ */ new Set()
  };
  return ssrContext;
}
function setSSRError(ssrContext, error) {
  ssrContext.error = true;
  ssrContext.payload = { error };
  ssrContext.url = error.url;
}

function buildAssetsDir() {
  return useRuntimeConfig().app.buildAssetsDir;
}
function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path);
}
function publicAssetsURL(...path) {
  const app = useRuntimeConfig().app;
  const publicBase = app.cdnURL || app.baseURL;
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase;
}

const APP_ROOT_OPEN_TAG = `<${appRootTag}${propsToString(appRootAttrs)}>`;
const APP_ROOT_CLOSE_TAG = `</${appRootTag}>`;
const getServerEntry = () => import('file://C:/Users/hp/Downloads/JabuSpark/.nuxt/dist/server/server.mjs').then((r) => r.default || r);
const getClientManifest = () => import('file://C:/Users/hp/Downloads/JabuSpark/.nuxt/dist/server/client.manifest.mjs').then((r) => r.default || r).then((r) => typeof r === "function" ? r() : r);
const getSSRRenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  if (!manifest) {
    throw new Error("client.manifest is not available");
  }
  const createSSRApp = await getServerEntry();
  if (!createSSRApp) {
    throw new Error("Server bundle is not available");
  }
  const options = {
    manifest,
    renderToString: renderToString$1,
    buildAssetsURL
  };
  const renderer = createRenderer(createSSRApp, options);
  async function renderToString$1(input, context) {
    const html = await renderToString(input, context);
    if (process.env.NUXT_VITE_NODE_OPTIONS) {
      renderer.rendererContext.updateManifest(await getClientManifest());
    }
    return APP_ROOT_OPEN_TAG + html + APP_ROOT_CLOSE_TAG;
  }
  return renderer;
});
const getSPARenderer = lazyCachedFunction(async () => {
  const manifest = await getClientManifest();
  const spaTemplate = await Promise.resolve().then(function () { return _virtual__spaTemplate; }).then((r) => r.template).catch(() => "").then((r) => {
    {
      return APP_ROOT_OPEN_TAG + r + APP_ROOT_CLOSE_TAG;
    }
  });
  const options = {
    manifest,
    renderToString: () => spaTemplate,
    buildAssetsURL
  };
  const renderer = createRenderer(() => () => {
  }, options);
  const result = await renderer.renderToString({});
  const renderToString = (ssrContext) => {
    const config = useRuntimeConfig(ssrContext.event);
    ssrContext.modules ||= /* @__PURE__ */ new Set();
    ssrContext.payload.serverRendered = false;
    ssrContext.config = {
      public: config.public,
      app: config.app
    };
    return Promise.resolve(result);
  };
  return {
    rendererContext: renderer.rendererContext,
    renderToString
  };
});
function lazyCachedFunction(fn) {
  let res = null;
  return () => {
    if (res === null) {
      res = fn().catch((err) => {
        res = null;
        throw err;
      });
    }
    return res;
  };
}
function getRenderer(ssrContext) {
  return ssrContext.noSSR ? getSPARenderer() : getSSRRenderer();
}
const getSSRStyles = lazyCachedFunction(() => Promise.resolve().then(function () { return styles$1; }).then((r) => r.default || r));

async function renderInlineStyles(usedModules) {
  const styleMap = await getSSRStyles();
  const inlinedStyles = /* @__PURE__ */ new Set();
  for (const mod of usedModules) {
    if (mod in styleMap && styleMap[mod]) {
      for (const style of await styleMap[mod]()) {
        inlinedStyles.add(style);
      }
    }
  }
  return Array.from(inlinedStyles).map((style) => ({ innerHTML: style }));
}

const ROOT_NODE_REGEX = new RegExp(`^<${appRootTag}[^>]*>([\\s\\S]*)<\\/${appRootTag}>$`);
function getServerComponentHTML(body) {
  const match = body.match(ROOT_NODE_REGEX);
  return match?.[1] || body;
}
const SSR_SLOT_TELEPORT_MARKER = /^uid=([^;]*);slot=(.*)$/;
const SSR_CLIENT_TELEPORT_MARKER = /^uid=([^;]*);client=(.*)$/;
const SSR_CLIENT_SLOT_MARKER = /^island-slot=([^;]*);(.*)$/;
function getSlotIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.slots).length) {
    return void 0;
  }
  const response = {};
  for (const [name, slot] of Object.entries(ssrContext.islandContext.slots)) {
    response[name] = {
      ...slot,
      fallback: ssrContext.teleports?.[`island-fallback=${name}`]
    };
  }
  return response;
}
function getClientIslandResponse(ssrContext) {
  if (!ssrContext.islandContext || !Object.keys(ssrContext.islandContext.components).length) {
    return void 0;
  }
  const response = {};
  for (const [clientUid, component] of Object.entries(ssrContext.islandContext.components)) {
    const html = ssrContext.teleports?.[clientUid]?.replaceAll("<!--teleport start anchor-->", "") || "";
    response[clientUid] = {
      ...component,
      html,
      slots: getComponentSlotTeleport(clientUid, ssrContext.teleports ?? {})
    };
  }
  return response;
}
function getComponentSlotTeleport(clientUid, teleports) {
  const entries = Object.entries(teleports);
  const slots = {};
  for (const [key, value] of entries) {
    const match = key.match(SSR_CLIENT_SLOT_MARKER);
    if (match) {
      const [, id, slot] = match;
      if (!slot || clientUid !== id) {
        continue;
      }
      slots[slot] = value;
    }
  }
  return slots;
}
function replaceIslandTeleports(ssrContext, html) {
  const { teleports, islandContext } = ssrContext;
  if (islandContext || !teleports) {
    return html;
  }
  for (const key in teleports) {
    const matchClientComp = key.match(SSR_CLIENT_TELEPORT_MARKER);
    if (matchClientComp) {
      const [, uid, clientId] = matchClientComp;
      if (!uid || !clientId) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-component="${clientId}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
      continue;
    }
    const matchSlot = key.match(SSR_SLOT_TELEPORT_MARKER);
    if (matchSlot) {
      const [, uid, slot] = matchSlot;
      if (!uid || !slot) {
        continue;
      }
      html = html.replace(new RegExp(` data-island-uid="${uid}" data-island-slot="${slot}"[^>]*>`), (full) => {
        return full + teleports[key];
      });
    }
  }
  return html;
}

const ISLAND_SUFFIX_RE = /\.json(\?.*)?$/;
const _SxA8c9 = defineEventHandler(async (event) => {
  const nitroApp = useNitroApp();
  setResponseHeaders(event, {
    "content-type": "application/json;charset=utf-8",
    "x-powered-by": "Nuxt"
  });
  const islandContext = await getIslandContext(event);
  const ssrContext = {
    ...createSSRContext(event),
    islandContext,
    noSSR: false,
    url: islandContext.url
  };
  const renderer = await getSSRRenderer();
  const renderResult = await renderer.renderToString(ssrContext).catch(async (error) => {
    await ssrContext.nuxt?.hooks.callHook("app:error", error);
    throw error;
  });
  const inlinedStyles = await renderInlineStyles(ssrContext.modules ?? []);
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult });
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  {
    const { styles } = getRequestDependencies(ssrContext, renderer.rendererContext);
    const link = [];
    for (const resource of Object.values(styles)) {
      if ("inline" in getQuery(resource.file)) {
        continue;
      }
      if (resource.file.includes("scoped") && !resource.file.includes("pages/")) {
        link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
      }
    }
    if (link.length) {
      ssrContext.head.push({ link }, { mode: "server" });
    }
  }
  const islandHead = {};
  for (const entry of ssrContext.head.entries.values()) {
    for (const [key, value] of Object.entries(resolveUnrefHeadInput(entry.input))) {
      const currentValue = islandHead[key];
      if (Array.isArray(currentValue)) {
        currentValue.push(...value);
      }
      islandHead[key] = value;
    }
  }
  islandHead.link ||= [];
  islandHead.style ||= [];
  const islandResponse = {
    id: islandContext.id,
    head: islandHead,
    html: getServerComponentHTML(renderResult.html),
    components: getClientIslandResponse(ssrContext),
    slots: getSlotIslandResponse(ssrContext)
  };
  await nitroApp.hooks.callHook("render:island", islandResponse, { event, islandContext });
  return islandResponse;
});
async function getIslandContext(event) {
  let url = event.path || "";
  const componentParts = url.substring("/__nuxt_island".length + 1).replace(ISLAND_SUFFIX_RE, "").split("_");
  const hashId = componentParts.length > 1 ? componentParts.pop() : void 0;
  const componentName = componentParts.join("_");
  const context = event.method === "GET" ? getQuery$1(event) : await readBody(event);
  const ctx = {
    url: "/",
    ...context,
    id: hashId,
    name: componentName,
    props: destr$1(context.props) || {},
    slots: {},
    components: {}
  };
  return ctx;
}

const _lazy__l0Dz4 = () => Promise.resolve().then(function () { return courseDocs_get$1; });
const _lazy_fgakhl = () => Promise.resolve().then(function () { return approve_post$1; });
const _lazy_XF2JrY = () => Promise.resolve().then(function () { return archive_post$1; });
const _lazy_hm9YPr = () => Promise.resolve().then(function () { return ask_post$1; });
const _lazy_VdaDbW = () => Promise.resolve().then(function () { return drill_post$1; });
const _lazy_YC6bFj = () => Promise.resolve().then(function () { return generate_post$1; });
const _lazy_J0N6Ht = () => Promise.resolve().then(function () { return ingest_post$1; });
const _lazy_P9YZMf = () => Promise.resolve().then(function () { return renderer$1; });

const handlers = [
  { route: '', handler: _1Rwqns, lazy: false, middleware: true, method: undefined },
  { route: '/api/admin/course-docs', handler: _lazy__l0Dz4, lazy: true, middleware: false, method: "get" },
  { route: '/api/admin/course-docs/approve', handler: _lazy_fgakhl, lazy: true, middleware: false, method: "post" },
  { route: '/api/admin/course-docs/archive', handler: _lazy_XF2JrY, lazy: true, middleware: false, method: "post" },
  { route: '/api/ask', handler: _lazy_hm9YPr, lazy: true, middleware: false, method: "post" },
  { route: '/api/drill', handler: _lazy_VdaDbW, lazy: true, middleware: false, method: "post" },
  { route: '/api/questions/generate', handler: _lazy_YC6bFj, lazy: true, middleware: false, method: "post" },
  { route: '/api/rag/ingest', handler: _lazy_J0N6Ht, lazy: true, middleware: false, method: "post" },
  { route: '/__nuxt_error', handler: _lazy_P9YZMf, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_island/**', handler: _SxA8c9, lazy: false, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_P9YZMf, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const captureError = (error, context = {}) => {
    const promise = hooks.callHookParallel("error", error, context).catch((error_) => {
      console.error("Error while capturing another error", error_);
    });
    if (context.event && isEvent(context.event)) {
      const errors = context.event.context.nitro?.errors;
      if (errors) {
        errors.push({ error, context });
      }
      if (context.event.waitUntil) {
        context.event.waitUntil(promise);
      }
    }
  };
  const h3App = createApp({
    debug: destr(true),
    onError: (error, event) => {
      captureError(error, { event, tags: ["request"] });
      return errorHandler(error, event);
    },
    onRequest: async (event) => {
      event.context.nitro = event.context.nitro || { errors: [] };
      const fetchContext = event.node.req?.__unenv__;
      if (fetchContext?._platform) {
        event.context = {
          _platform: fetchContext?._platform,
          // #3335
          ...fetchContext._platform,
          ...event.context
        };
      }
      if (!event.context.waitUntil && fetchContext?.waitUntil) {
        event.context.waitUntil = fetchContext.waitUntil;
      }
      event.fetch = (req, init) => fetchWithEvent(event, req, init, { fetch: localFetch });
      event.$fetch = (req, init) => fetchWithEvent(event, req, init, {
        fetch: $fetch
      });
      event.waitUntil = (promise) => {
        if (!event.context.nitro._waitUntilPromises) {
          event.context.nitro._waitUntilPromises = [];
        }
        event.context.nitro._waitUntilPromises.push(promise);
        if (event.context.waitUntil) {
          event.context.waitUntil(promise);
        }
      };
      event.captureError = (error, context) => {
        captureError(error, { event, ...context });
      };
      await nitroApp$1.hooks.callHook("request", event).catch((error) => {
        captureError(error, { event, tags: ["request"] });
      });
    },
    onBeforeResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("beforeResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    },
    onAfterResponse: async (event, response) => {
      await nitroApp$1.hooks.callHook("afterResponse", event, response).catch((error) => {
        captureError(error, { event, tags: ["request", "response"] });
      });
    }
  });
  const router = createRouter$1({
    preemptive: true
  });
  const nodeHandler = toNodeListener(h3App);
  const localCall = (aRequest) => callNodeRequestHandler(nodeHandler, aRequest);
  const localFetch = (input, init) => {
    if (!input.toString().startsWith("/")) {
      return globalThis.fetch(input, init);
    }
    return fetchNodeRequestHandler(
      nodeHandler,
      input,
      init
    ).then((response) => normalizeFetchResponse(response));
  };
  const $fetch = createFetch({
    fetch: localFetch,
    Headers: Headers$1,
    defaults: { baseURL: config.app.baseURL }
  });
  globalThis.$fetch = $fetch;
  h3App.use(createRouteRulesHandler({ localFetch }));
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(
        /\/+/g,
        "/"
      );
      h3App.use(middlewareBase, handler);
    } else {
      const routeRules = getRouteRulesForPath(
        h.route.replace(/:\w+|\*\*/g, "_")
      );
      if (routeRules.cache) {
        handler = cachedEventHandler(handler, {
          group: "nitro/routes",
          ...routeRules.cache
        });
      }
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router.handler);
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch,
    captureError
  };
  return app;
}
function runNitroPlugins(nitroApp2) {
  for (const plugin of plugins) {
    try {
      plugin(nitroApp2);
    } catch (error) {
      nitroApp2.captureError(error, { tags: ["plugin"] });
      throw error;
    }
  }
}
const nitroApp$1 = createNitroApp();
function useNitroApp() {
  return nitroApp$1;
}
runNitroPlugins(nitroApp$1);

function defineRenderHandler(render) {
  const runtimeConfig = useRuntimeConfig();
  return eventHandler(async (event) => {
    const nitroApp = useNitroApp();
    const ctx = { event, render, response: void 0 };
    await nitroApp.hooks.callHook("render:before", ctx);
    if (!ctx.response) {
      if (event.path === `${runtimeConfig.app.baseURL}favicon.ico`) {
        setResponseHeader(event, "Content-Type", "image/x-icon");
        return send(
          event,
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
        );
      }
      ctx.response = await ctx.render(event);
      if (!ctx.response) {
        const _currentStatus = getResponseStatus(event);
        setResponseStatus(event, _currentStatus === 200 ? 500 : _currentStatus);
        return send(
          event,
          "No response returned from render handler: " + event.path
        );
      }
    }
    await nitroApp.hooks.callHook("render:response", ctx.response, ctx);
    if (ctx.response.headers) {
      setResponseHeaders(event, ctx.response.headers);
    }
    if (ctx.response.statusCode || ctx.response.statusMessage) {
      setResponseStatus(
        event,
        ctx.response.statusCode,
        ctx.response.statusMessage
      );
    }
    return ctx.response.body;
  });
}

const scheduledTasks = false;

const tasks = {
  
};

const __runningTasks__ = {};
async function runTask(name, {
  payload = {},
  context = {}
} = {}) {
  if (__runningTasks__[name]) {
    return __runningTasks__[name];
  }
  if (!(name in tasks)) {
    throw createError({
      message: `Task \`${name}\` is not available!`,
      statusCode: 404
    });
  }
  if (!tasks[name].resolve) {
    throw createError({
      message: `Task \`${name}\` is not implemented!`,
      statusCode: 501
    });
  }
  const handler = await tasks[name].resolve();
  const taskEvent = { name, payload, context };
  __runningTasks__[name] = handler.run(taskEvent);
  try {
    const res = await __runningTasks__[name];
    return res;
  } finally {
    delete __runningTasks__[name];
  }
}

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto;
}
const { NITRO_NO_UNIX_SOCKET, NITRO_DEV_WORKER_ID } = process.env;
trapUnhandledNodeErrors();
parentPort?.on("message", (msg) => {
  if (msg && msg.event === "shutdown") {
    shutdown();
  }
});
const nitroApp = useNitroApp();
const server = new Server(toNodeListener(nitroApp.h3App));
let listener;
listen().catch(() => listen(
  true
  /* use random port */
)).catch((error) => {
  console.error("Dev worker failed to listen:", error);
  return shutdown();
});
nitroApp.router.get(
  "/_nitro/tasks",
  defineEventHandler(async (event) => {
    const _tasks = await Promise.all(
      Object.entries(tasks).map(async ([name, task]) => {
        const _task = await task.resolve?.();
        return [name, { description: _task?.meta?.description }];
      })
    );
    return {
      tasks: Object.fromEntries(_tasks),
      scheduledTasks
    };
  })
);
nitroApp.router.use(
  "/_nitro/tasks/:name",
  defineEventHandler(async (event) => {
    const name = getRouterParam(event, "name");
    const payload = {
      ...getQuery$1(event),
      ...await readBody(event).then((r) => r?.payload).catch(() => ({}))
    };
    return await runTask(name, { payload });
  })
);
function listen(useRandomPort = Boolean(
  NITRO_NO_UNIX_SOCKET || process.versions.webcontainer || "Bun" in globalThis && process.platform === "win32"
)) {
  return new Promise((resolve, reject) => {
    try {
      listener = server.listen(useRandomPort ? 0 : getSocketAddress(), () => {
        const address = server.address();
        parentPort?.postMessage({
          event: "listen",
          address: typeof address === "string" ? { socketPath: address } : { host: "localhost", port: address?.port }
        });
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}
function getSocketAddress() {
  const socketName = `nitro-worker-${process.pid}-${threadId}-${NITRO_DEV_WORKER_ID}-${Math.round(Math.random() * 1e4)}.sock`;
  if (process.platform === "win32") {
    return join(String.raw`\\.\pipe`, socketName);
  }
  if (process.platform === "linux") {
    const nodeMajor = Number.parseInt(process.versions.node.split(".")[0], 10);
    if (nodeMajor >= 20) {
      return `\0${socketName}`;
    }
  }
  return join(tmpdir(), socketName);
}
async function shutdown() {
  server.closeAllConnections?.();
  await Promise.all([
    new Promise((resolve) => listener?.close(resolve)),
    nitroApp.hooks.callHook("close").catch(console.error)
  ]);
  parentPort?.postMessage({ event: "exit" });
}

const _messages = { "appName": "Nuxt", "version": "", "statusCode": 500, "statusMessage": "Server error", "description": "An error occurred in the application and the page could not be served. If you are the application owner, check your server logs for details.", "stack": "" };
const template$1 = (messages) => {
  messages = { ..._messages, ...messages };
  return '<!DOCTYPE html><html lang="en"><head><title>' + escapeHtml(messages.statusCode) + " - " + escapeHtml(messages.statusMessage || "Internal Server Error") + `</title><meta charset="utf-8"><meta content="width=device-width,initial-scale=1.0,minimum-scale=1.0" name="viewport"><style>.spotlight{background:linear-gradient(45deg,#00dc82,#36e4da 50%,#0047e1);bottom:-40vh;filter:blur(30vh);height:60vh;opacity:.8}*,:after,:before{border-color:var(--un-default-border-color,#e5e7eb);border-style:solid;border-width:0;box-sizing:border-box}:after,:before{--un-content:""}html{line-height:1.5;-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;font-feature-settings:normal;font-variation-settings:normal;-moz-tab-size:4;tab-size:4;-webkit-tap-highlight-color:transparent}body{line-height:inherit;margin:0}h1{font-size:inherit;font-weight:inherit}h1,p{margin:0}*,:after,:before{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 transparent;--un-ring-shadow:0 0 transparent;--un-shadow-inset: ;--un-shadow:0 0 transparent;--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: }.pointer-events-none{pointer-events:none}.fixed{position:fixed}.left-0{left:0}.right-0{right:0}.z-10{z-index:10}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.h-auto{height:auto}.min-h-screen{min-height:100vh}.flex{display:flex}.flex-1{flex:1 1 0%}.flex-col{flex-direction:column}.overflow-y-auto{overflow-y:auto}.rounded-t-md{border-top-left-radius:.375rem;border-top-right-radius:.375rem}.bg-black\\/5{background-color:#0000000d}.bg-white{--un-bg-opacity:1;background-color:rgb(255 255 255/var(--un-bg-opacity))}.p-8{padding:2rem}.px-10{padding-left:2.5rem;padding-right:2.5rem}.pt-14{padding-top:3.5rem}.text-6xl{font-size:3.75rem;line-height:1}.text-xl{font-size:1.25rem;line-height:1.75rem}.text-black{--un-text-opacity:1;color:rgb(0 0 0/var(--un-text-opacity))}.font-light{font-weight:300}.font-medium{font-weight:500}.leading-tight{line-height:1.25}.font-sans{font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}@media (prefers-color-scheme:dark){.dark\\:bg-black{--un-bg-opacity:1;background-color:rgb(0 0 0/var(--un-bg-opacity))}.dark\\:bg-white\\/10{background-color:#ffffff1a}.dark\\:text-white{--un-text-opacity:1;color:rgb(255 255 255/var(--un-text-opacity))}}@media (min-width:640px){.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}.sm\\:text-8xl{font-size:6rem;line-height:1}}</style><script>!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))r(e);new MutationObserver((e=>{for(const o of e)if("childList"===o.type)for(const e of o.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&r(e)})).observe(document,{childList:!0,subtree:!0})}function r(e){if(e.ep)return;e.ep=!0;const r=function(e){const r={};return e.integrity&&(r.integrity=e.integrity),e.referrerPolicy&&(r.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?r.credentials="include":"anonymous"===e.crossOrigin?r.credentials="omit":r.credentials="same-origin",r}(e);fetch(e.href,r)}}();<\/script></head><body class="antialiased bg-white dark:bg-black dark:text-white flex flex-col font-sans min-h-screen pt-14 px-10 text-black"><div class="fixed left-0 pointer-events-none right-0 spotlight"></div><h1 class="font-medium mb-6 sm:text-8xl text-6xl">` + escapeHtml(messages.statusCode) + '</h1><p class="font-light leading-tight mb-8 sm:text-2xl text-xl">' + escapeHtml(messages.description) + '</p><div class="bg-black/5 bg-white dark:bg-white/10 flex-1 h-auto overflow-y-auto rounded-t-md"><div class="font-light leading-tight p-8 text-xl z-10">' + escapeHtml(messages.stack) + "</div></div></body></html>";
};

const errorDev = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template$1
}, Symbol.toStringTag, { value: 'Module' }));

const template = "";

const _virtual__spaTemplate = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  template: template
}, Symbol.toStringTag, { value: 'Module' }));

const styles = {};

const styles$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: styles
}, Symbol.toStringTag, { value: 'Module' }));

async function fetchWithRetry(req, init) {
  const retries = 3;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(req, init);
    } catch (error) {
      if (init?.signal?.aborted) {
        throw error;
      }
      if (attempt === retries) {
        console.error(`Error fetching request ${req}`, error, init);
        throw error;
      }
      console.warn(`Retrying fetch attempt ${attempt + 1} for request: ${req}`);
    }
  }
  throw new Error("Unreachable code");
}

function setCookies(event, cookies) {
  const response = event.node.res;
  const headersWritable = () => !response.headersSent && !response.writableEnded;
  if (!headersWritable()) {
    return;
  }
  for (const { name, value, options } of cookies) {
    if (!headersWritable()) {
      break;
    }
    setCookie(event, name, value, options);
  }
}

const ELEVATED_ROLES = ["tutor", "admin"];
async function requireTutorOrAdminRole(supabase, userId) {
  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  const role = (data == null ? void 0 : data.role) || "student";
  if (!ELEVATED_ROLES.includes(role)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Tutor or admin access required."
    });
  }
  return role;
}

const STUB_VECTOR_SIZE = 768;
const MAX_BATCH = 32;
async function embedText(text) {
  const vectors = await embedTexts([text]);
  return vectors[0] || buildStubVector(text);
}
async function embedTexts(texts) {
  var _a;
  if (!Array.isArray(texts) || !texts.length) {
    return [];
  }
  const config = useRuntimeConfig();
  const provider = ((_a = config.public) == null ? void 0 : _a.embeddingProvider) || "gemini";
  const apiKey = config.geminiApiKey;
  const rawModel = config.geminiModelEmbedding || "text-embedding-004";
  const model = rawModel.startsWith("models/") ? rawModel : `models/${rawModel}`;
  const shouldUseStub = provider !== "gemini" || config.geminiDisabled || !apiKey || !model;
  if (shouldUseStub) {
    return texts.map((text) => buildStubVector(text));
  }
  const vectors = [];
  for (let i = 0; i < texts.length; i += MAX_BATCH) {
    const slice = texts.slice(i, i + MAX_BATCH);
    const batchVectors = await requestEmbeddingBatch(slice, model, apiKey);
    vectors.push(...batchVectors);
  }
  return vectors;
}
async function requestEmbeddingBatch(texts, model, apiKey) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`;
  const body = {
    // Each request repeats the same model name
    requests: texts.map((text) => ({
      model,
      content: {
        parts: [{ text: (text == null ? void 0 : text.length) ? text : " " }]
      }
    }))
  };
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error("Gemini embedding request failed (network)", err);
    return texts.map((text) => buildStubVector(text));
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini embedding HTTP error", response.status, errorText);
    throw createError({
      statusCode: 500,
      statusMessage: `Gemini embedding request failed (${response.status})`
    });
  }
  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    console.error("Gemini embedding JSON parse failed", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini embedding response was invalid JSON."
    });
  }
  const embeddings = Array.isArray(payload == null ? void 0 : payload.embeddings) ? payload.embeddings : [];
  return texts.map((text, index) => {
    var _a;
    const vector = (_a = embeddings[index]) == null ? void 0 : _a.values;
    if (Array.isArray(vector) && vector.length) {
      return vector;
    }
    return buildStubVector(text);
  });
}
function buildStubVector(text) {
  const normalized = typeof text === "string" ? text : "";
  const vector = [];
  let seed = 0;
  for (let i = 0; i < normalized.length; i += 1) {
    seed = seed * 31 + normalized.charCodeAt(i) >>> 0;
  }
  for (let i = 0; i < STUB_VECTOR_SIZE; i += 1) {
    seed = 1103515245 * seed + 12345 >>> 0;
    vector.push(seed % 1e3 / 1e3);
  }
  return vector;
}

async function generateGeminiText({
  systemInstruction,
  userParts,
  temperature = 0.2,
  maxOutputTokens = 1024,
  responseMimeType
}) {
  var _a, _b, _c, _d, _e, _f;
  const config = useRuntimeConfig();
  const apiKey = config.geminiApiKey;
  const rawModel = config.geminiModelText || "gemini-2.5-flash";
  const model = rawModel.startsWith("models/") ? rawModel : `models/${rawModel}`;
  if (config.geminiDisabled) {
    return "Gemini is currently disabled. Please try again later.";
  }
  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini API key missing"
    });
  }
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;
  const contents = [
    {
      role: "user",
      parts: (userParts || []).map((text) => ({ text }))
    }
  ];
  const body = {
    contents,
    generationConfig: {
      temperature,
      maxOutputTokens
    }
  };
  if (responseMimeType) {
    body.generationConfig.responseMimeType = responseMimeType;
  }
  if (systemInstruction) {
    body.systemInstruction = {
      role: "system",
      parts: [{ text: systemInstruction }]
    };
  }
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error("Gemini text request failed (network)", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini request failed (network error)"
    });
  }
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Gemini text HTTP error", response.status, errorText);
    throw createError({
      statusCode: 500,
      statusMessage: `Gemini request failed (${response.status})`
    });
  }
  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    console.error("Gemini text JSON parse failed (outer payload)", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini response was invalid JSON."
    });
  }
  const candidate = (_a = payload == null ? void 0 : payload.candidates) == null ? void 0 : _a[0];
  if (!candidate) {
    console.error(
      "Gemini returned no candidates",
      JSON.stringify((payload == null ? void 0 : payload.promptFeedback) || payload, null, 2)
    );
    if (responseMimeType === "application/json") {
      return { questions: [] };
    }
    const blockReason = ((_b = payload == null ? void 0 : payload.promptFeedback) == null ? void 0 : _b.blockReason) || ((_e = (_d = (_c = payload == null ? void 0 : payload.promptFeedback) == null ? void 0 : _c.safetyRatings) == null ? void 0 : _d[0]) == null ? void 0 : _e.category) || "unknown";
    throw createError({
      statusCode: 502,
      statusMessage: `Gemini returned no content (block reason: ${blockReason})`
    });
  }
  const parts = ((_f = candidate == null ? void 0 : candidate.content) == null ? void 0 : _f.parts) || [];
  if (responseMimeType === "application/json") {
    let combined = parts.map((p) => p.text || "").join("").trim();
    if (!combined) {
      console.warn("Gemini JSON empty response for structured call");
      return { questions: [] };
    }
    const firstBrace = combined.indexOf("{");
    const lastBrace = combined.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      combined = combined.slice(firstBrace, lastBrace + 1);
    }
    combined = combined.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    combined = combined.replace(/,\s*(\]|\})/g, "$1");
    try {
      return JSON.parse(combined);
    } catch (err) {
      console.error("Gemini JSON content parse failed", combined, err);
      return { questions: [] };
    }
  }
  const fullText = parts.map((p) => p.text || "").join("").trim();
  if (!fullText) {
    throw createError({
      statusCode: 500,
      statusMessage: "Gemini returned empty response"
    });
  }
  return fullText;
}

async function extractPdfPages(buffer) {
  const pages = [];
  const options = {
    pagerender: (pageData) => pageData.getTextContent({ normalizeWhitespace: true }).then((textContent) => {
      const text = textContent.items.map((item) => item.str).join(" ");
      pages.push(text);
      return text;
    })
  };
  await pdf(buffer, options);
  return pages.map((content, idx) => ({ page: idx + 1, content: content.trim() }));
}

function chunkPages(pages, chunkSize = 900) {
  const chunks = [];
  pages.forEach((page) => {
    const text = page.content.replace(/\s+/g, " ").trim();
    if (!text) return;
    for (let i = 0; i < text.length; i += chunkSize) {
      const slice = text.slice(i, i + chunkSize);
      chunks.push({ page: page.page, content: slice });
    }
  });
  return chunks;
}
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}
function composeAnswer(question, matches) {
  if (!matches.length) {
    return {
      answer: "Need more sources. Upload the relevant PDF first.",
      citations: [],
      confidence: 0
    };
  }
  const top = matches.slice(0, 3);
  const sentences = top.map((chunk) => summarizeChunk(chunk.content));
  const answer = sentences.join(" ").slice(0, 400);
  const citations = top.map((chunk) => ({
    docId: chunk.doc_id,
    docTitle: chunk.doc_title || "Doc",
    page: chunk.page,
    span: chunk.content.slice(0, 160)
  }));
  const mean = matches.reduce((sum, item) => sum + item.score, 0) / matches.length;
  const confidence = Math.max(0, Math.min(0.99, (mean + 1) / 2));
  return { answer, citations, confidence };
}
function summarizeChunk(text) {
  const trimmed = text.trim();
  if (trimmed.length <= 150) return trimmed;
  return trimmed.slice(0, 150) + "...";
}

function createServiceClient() {
  const config = useRuntimeConfig();
  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Supabase service credentials"
    });
  }
  return createClient(config.public.supabaseUrl, config.supabaseServiceKey);
}

const serverSupabaseClient = async (event) => {
  if (!event.context._supabaseClient) {
    const { url, key, cookiePrefix, cookieOptions, clientOptions: { auth = {}, global = {} } } = useRuntimeConfig(event).public.supabase;
    event.context._supabaseClient = createServerClient(url, key, {
      auth,
      cookies: {
        getAll: () => parseCookieHeader(getHeader(event, "Cookie") ?? ""),
        setAll: (cookies) => setCookies(event, cookies)
      },
      cookieOptions: {
        ...cookieOptions,
        name: cookiePrefix
      },
      global: {
        fetch: fetchWithRetry,
        ...global
      }
    });
  }
  return event.context._supabaseClient;
};

const serverSupabaseUser = async (event) => {
  const client = await serverSupabaseClient(event);
  const { data: { user }, error } = await client.auth.getUser();
  if (error) {
    throw createError({ statusMessage: error?.message });
  }
  return user;
};

const courseDocs_get = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Sign in required." });
  }
  const supabase = createServiceClient();
  await requireTutorOrAdminRole(supabase, user.id);
  const { data: docs, error } = await supabase.from("documents").select("id, user_id, title, course, doc_type, visibility, status, approval_status, created_at").eq("visibility", "course").neq("status", "failed").order("created_at", { ascending: false });
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  const uploaderIds = Array.from(
    new Set((docs || []).map((doc) => doc.user_id).filter((id) => Boolean(id)))
  );
  const profileMap = /* @__PURE__ */ new Map();
  if (uploaderIds.length) {
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("id, full_name, email").in("id", uploaderIds);
    if (profilesError) {
      throw createError({ statusCode: 500, statusMessage: profilesError.message });
    }
    profiles == null ? void 0 : profiles.forEach((profile) => {
      profileMap.set(profile.id, { full_name: profile.full_name, email: profile.email });
    });
  }
  const payload = (docs || []).map((doc) => {
    const uploader = profileMap.get(doc.user_id) || { full_name: null, email: null };
    return {
      id: doc.id,
      title: doc.title,
      course: doc.course,
      doc_type: doc.doc_type,
      visibility: doc.visibility,
      status: doc.status,
      approval_status: doc.approval_status,
      uploader_name: uploader.full_name,
      uploader_email: uploader.email,
      created_at: doc.created_at
    };
  });
  return { docs: payload };
});

const courseDocs_get$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: courseDocs_get
}, Symbol.toStringTag, { value: 'Module' }));

const approve_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Sign in required." });
  }
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.id)) {
    throw createError({ statusCode: 400, statusMessage: "Document id required." });
  }
  const supabase = createServiceClient();
  await requireTutorOrAdminRole(supabase, user.id);
  const { data, error } = await supabase.from("documents").update({ approval_status: "approved" }).eq("id", body.id).eq("visibility", "course").select("id").maybeSingle();
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: "Document not found." });
  }
  return { success: true };
});

const approve_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: approve_post
}, Symbol.toStringTag, { value: 'Module' }));

const archive_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Sign in required." });
  }
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.id)) {
    throw createError({ statusCode: 400, statusMessage: "Document id required." });
  }
  const supabase = createServiceClient();
  await requireTutorOrAdminRole(supabase, user.id);
  const { data, error } = await supabase.from("documents").update({ approval_status: "archived" }).eq("id", body.id).eq("visibility", "course").select("id").maybeSingle();
  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: "Document not found." });
  }
  return { success: true };
});

const archive_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: archive_post
}, Symbol.toStringTag, { value: 'Module' }));

const ask_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig();
  const body = await readBody(event);
  const question = (_a = body == null ? void 0 : body.question) == null ? void 0 : _a.trim();
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: "Question required" });
  }
  const supabase = await serverSupabaseClient(event);
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Auth required" });
  }
  if (config.geminiDisabled) {
    return {
      sessionId: null,
      answer: "Ask mode is temporarily offline while we upgrade the AI. You can still read your PDFs and run drills with any saved questions.",
      confidence: 0,
      citations: []
    };
  }
  let docsQuery = supabase.from("documents").select("id, title").eq("user_id", user.id).eq("status", "ready");
  if ((_b = body.docIds) == null ? void 0 : _b.length) {
    docsQuery = docsQuery.in("id", body.docIds);
  }
  const { data: docs, error: docsError } = await docsQuery;
  if (docsError) throw createError({ statusCode: 500, statusMessage: docsError.message });
  if (!(docs == null ? void 0 : docs.length)) {
    throw createError({ statusCode: 400, statusMessage: "Select at least one ready document." });
  }
  const allowedDocIds = docs.map((doc) => doc.id);
  const docTitleMap = Object.fromEntries(docs.map((doc) => [doc.id, doc.title]));
  const queryEmbedding = await embedText(question);
  const { data: chunks, error } = await supabase.from("doc_chunks").select("doc_id, page, content, embedding").in("doc_id", allowedDocIds).limit(400);
  if (error) throw createError({ statusCode: 500, statusMessage: error.message });
  const scored = (chunks || []).map((chunk) => {
    const embedding = normalizeEmbedding(chunk.embedding);
    if (!embedding) return null;
    return {
      ...chunk,
      embedding,
      score: cosineSimilarity(queryEmbedding, embedding)
    };
  }).filter((chunk) => Boolean(chunk));
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 12);
  if (!top.length) {
    throw createError({ statusCode: 400, statusMessage: "No indexed pages found. Re-run ingest first." });
  }
  const context = buildContext(top, docTitleMap);
  let answerText = "";
  let usedFallback = false;
  try {
    const response = await generateGeminiText({
      systemInstruction: "You are the JabuSpark Ask Tutor for JABU nursing students. Answer only with the provided context excerpts, cite page numbers when possible, and clearly state when the answer cannot be found in the excerpts.",
      userParts: [
        `Context:

${context}`,
        `Question:

${question}`
      ],
      temperature: 0.2,
      maxOutputTokens: 800
    });
    answerText = typeof response === "string" ? response : JSON.stringify(response);
  } catch (err) {
    console.error("Gemini answer generation failed", err);
    usedFallback = true;
    const fallback = composeAnswer(question, top.map((chunk) => ({ ...chunk, doc_title: docTitleMap[chunk.doc_id] })));
    answerText = fallback.answer;
  }
  const citations = top.slice(0, 6).map((chunk) => ({
    docId: chunk.doc_id,
    page: chunk.page,
    text: chunk.content.slice(0, 280),
    score: chunk.score,
    docTitle: docTitleMap[chunk.doc_id]
  }));
  const confidence = computeConfidence(top);
  const sessionId = randomUUID();
  const { error: sessionError } = await supabase.from("sessions").upsert({
    id: sessionId,
    user_id: user.id,
    mode: "ask",
    doc_id: allowedDocIds.length === 1 ? allowedDocIds[0] : null,
    metadata: {
      question,
      docIds: allowedDocIds,
      citations: citations.map(({ docId, page, text, score }) => ({ docId, page, text, score })),
      usedFallback
    }
  });
  if (sessionError) {
    console.error("Failed to persist ask session", sessionError.message);
  }
  if (top.length) {
    await supabase.from("matches").insert(
      top.slice(0, 8).map((chunk) => ({
        ask_id: sessionId,
        doc_id: chunk.doc_id,
        page: chunk.page,
        score: chunk.score,
        span: chunk.content.slice(0, 200)
      }))
    );
  }
  return {
    sessionId,
    answer: answerText,
    confidence,
    chunkCount: top.length,
    usedDocIds: allowedDocIds,
    citations: citations.map((citation) => ({
      docId: citation.docId,
      page: citation.page,
      text: citation.text,
      score: citation.score,
      docTitle: citation.docTitle
    }))
  };
});
function buildContext(chunks, docTitleMap) {
  return chunks.map((chunk, index) => {
    const snippet = chunk.content.replace(/\s+/g, " ").trim().slice(0, 1200);
    const title = docTitleMap[chunk.doc_id] || chunk.doc_id;
    return `Source ${index + 1} - ${title} (Page ${chunk.page}):
${snippet}`;
  }).join("\n\n");
}
function computeConfidence(chunks) {
  if (!chunks.length) return 0;
  const avg = chunks.reduce((sum, chunk) => sum + chunk.score, 0) / chunks.length;
  return Math.max(0, Math.min(1, (avg + 1) / 2));
}
function normalizeEmbedding(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    if (Array.isArray(raw.embedding)) return raw.embedding;
    if (Array.isArray(raw.value)) return raw.value;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.embedding)) return parsed.embedding;
        if (Array.isArray(parsed.value)) return parsed.value;
      }
    } catch {
    }
  }
  return null;
}

const ask_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: ask_post
}, Symbol.toStringTag, { value: 'Module' }));

const DEFAULT_COUNT = 10;
const MIN_COUNT = 1;
const MAX_COUNT = 50;
const drill_post = defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Sign in required." });
  }
  const body = await readBody(event);
  const difficulty = normalizeDifficulty(body == null ? void 0 : body.difficulty);
  const docIds = normalizeDocIds(body == null ? void 0 : body.docIds);
  if (!docIds.length) {
    throw createError({ statusCode: 400, statusMessage: "Select at least one document." });
  }
  const requestedCount = typeof (body == null ? void 0 : body.count) === "number" ? body.count : DEFAULT_COUNT;
  const targetCount = clamp$1(requestedCount, MIN_COUNT, MAX_COUNT);
  const supabase = createServiceClient();
  const { data: docs, error: docsError } = await supabase.from("documents").select("id").eq("user_id", user.id).eq("status", "ready").in("id", docIds);
  if (docsError) {
    throw createError({ statusCode: 500, statusMessage: docsError.message });
  }
  if (!(docs == null ? void 0 : docs.length)) {
    throw createError({
      statusCode: 400,
      statusMessage: "No ready documents matched your selection."
    });
  }
  if (docs.length !== docIds.length) {
    throw createError({
      statusCode: 403,
      statusMessage: "Some selected documents are not accessible or ready yet."
    });
  }
  const verifiedDocIds = docs.map((doc) => doc.id);
  const { data: rows, error: questionsError } = await supabase.from("questions").select("*").in("doc_id", verifiedDocIds);
  if (questionsError) {
    throw createError({ statusCode: 500, statusMessage: questionsError.message });
  }
  if (!(rows == null ? void 0 : rows.length)) {
    throw createError({
      statusCode: 404,
      statusMessage: "No pre-generated questions found for these docs yet."
    });
  }
  let questionRows = rows != null ? rows : [];
  if (difficulty !== "mixed") {
    const filtered = questionRows.filter((row) => {
      const value = typeof row.difficulty === "string" ? row.difficulty.toLowerCase() : "";
      return value === difficulty;
    });
    if (filtered.length) {
      questionRows = filtered;
    }
  }
  const shuffled = shuffle(questionRows.slice());
  const selected = shuffled.slice(0, Math.min(targetCount, shuffled.length));
  const mapped = [];
  for (const row of selected) {
    const question = mapRowToQuestion(row);
    if (question) {
      mapped.push(question);
    }
  }
  if (!mapped.length) {
    throw createError({
      statusCode: 500,
      statusMessage: "Stored questions were missing required fields."
    });
  }
  const sessionId = await logDrillSession(supabase, {
    userId: user.id,
    docIds: verifiedDocIds,
    questionCount: mapped.length,
    difficulty
  });
  return {
    sessionId,
    questions: mapped
  };
});
function normalizeDocIds(docIds) {
  if (!Array.isArray(docIds)) return [];
  const unique = /* @__PURE__ */ new Set();
  for (const id of docIds) {
    if (typeof id !== "string") continue;
    const trimmed = id.trim();
    if (!trimmed) continue;
    unique.add(trimmed);
  }
  return Array.from(unique);
}
function mapRowToQuestion(row) {
  if (!row) return null;
  const stem = typeof row.stem === "string" ? row.stem.trim() : "";
  const id = typeof row.id === "string" ? row.id : row.id != null ? String(row.id) : "";
  if (!stem || !id) return null;
  const rawOptions = Array.isArray(row.options) ? row.options : [];
  const options = rawOptions.map(
    (option) => typeof option === "string" ? option : option != null ? String(option) : ""
  ).filter((option) => option.length > 0);
  const correct = typeof row.correct === "number" ? row.correct : options.length ? 0 : -1;
  const explanation = typeof row.explanation === "string" && row.explanation.length ? row.explanation : null;
  return {
    id,
    stem,
    options,
    correct,
    explanation,
    docId: typeof row.doc_id === "string" && row.doc_id.length ? row.doc_id : null,
    topic: typeof row.section_topic === "string" && row.section_topic.length ? row.section_topic : null,
    sectionId: typeof row.section_id === "string" && row.section_id.length ? row.section_id : null
  };
}
function shuffle(values) {
  for (let i = values.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}
function clamp$1(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
async function logDrillSession(supabase, params) {
  var _a, _b, _c, _d;
  try {
    const basePayload = {
      user_id: params.userId,
      doc_ids: params.docIds,
      question_count: params.questionCount
    };
    if (params.difficulty && params.difficulty !== "mixed") {
      basePayload.difficulty = params.difficulty;
    }
    const { data, error } = await supabase.from("drills").insert(basePayload).select("id").maybeSingle();
    if (!error) {
      return (_a = data == null ? void 0 : data.id) != null ? _a : null;
    }
    if (error.code === "42703" && "difficulty" in basePayload) {
      delete basePayload.difficulty;
      const retry = await supabase.from("drills").insert(basePayload).select("id").maybeSingle();
      if (!retry.error) {
        return (_c = (_b = retry.data) == null ? void 0 : _b.id) != null ? _c : null;
      }
      if (((_d = retry.error) == null ? void 0 : _d.code) === "42P01") {
        console.warn("drills table missing; skipping drill session logging.");
        return null;
      }
      if (retry.error) {
        console.error("Failed to log drill session after retry", retry.error);
        return null;
      }
    }
    if (error.code === "42P01") {
      console.warn("drills table missing; skipping drill session logging.");
      return null;
    }
    console.error("Failed to log drill session", error);
    return null;
  } catch (err) {
    console.error("Unexpected drill session logging failure", err);
    return null;
  }
}
function normalizeDifficulty(value) {
  const normalized = typeof value === "string" ? value.toLowerCase().trim() : "";
  if (normalized === "easy" || normalized === "hard") return normalized;
  return "mixed";
}

const drill_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: drill_post
}, Symbol.toStringTag, { value: 'Module' }));

const generate_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig();
  const body = await readBody(event);
  if (config.geminiDisabled) {
    return {
      success: false,
      docId: (body == null ? void 0 : body.docId) || null,
      created: 0,
      message: "Gemini is currently disabled."
    };
  }
  let userId = null;
  try {
    const user = await serverSupabaseUser(event);
    userId = (_a = user == null ? void 0 : user.id) != null ? _a : null;
  } catch {
    userId = null;
  }
  if (!(body == null ? void 0 : body.docId) || typeof body.docId !== "string") {
    throw createError({ statusCode: 400, statusMessage: "docId is required." });
  }
  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (!context) {
    throw createError({
      statusCode: 400,
      statusMessage: "context is required and must be non-empty."
    });
  }
  const supabase = createServiceClient();
  const { data: doc, error: docError } = await supabase.from("documents").select("id, user_id, course, title").eq("id", body.docId).maybeSingle();
  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message });
  }
  if (!doc) {
    throw createError({ statusCode: 404, statusMessage: "Document not found." });
  }
  if (userId && doc.user_id !== userId) {
    throw createError({
      statusCode: 403,
      statusMessage: "You do not have access to this document."
    });
  }
  const mode = body.mode === "short-answer" ? "short-answer" : "mcq";
  const count = clamp(typeof body.count === "number" ? body.count : 5, 1, 10);
  try {
    const geminiResponse = await generateGeminiText({
      systemInstruction: `
You are an exam question generator for Joseph Ayo Babalola University nursing students.

You MUST always respond with a single valid JSON object and nothing else.
No markdown, no code fences, no comments, no extra text.

The JSON MUST match this type exactly:

{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "answer": 0 | 1 | 2 | 3,
      "explanation": string
    }
  ]
}

- "question": the question stem.
- "options": four distinct answer options for MCQ.
- "answer": the index (0-3) of the correct option.
- "explanation": a short explanation of the answer.

Do not add any other properties. Do not wrap the JSON in backticks.
`.trim(),
      userParts: [
        `Use ONLY the text below as your source material for generating questions for JABU Nursing students.

CONTEXT:
${context}`,
        `Generate ${count} ${mode === "mcq" ? "4-option multiple-choice" : "short-answer"} exam-style questions.`,
        mode === "mcq" ? 'For each question, fill "options" with four options and set "answer" to the index (0-3) of the correct one. Respond ONLY with the JSON object.' : 'For each short-answer question, you may leave "options" as an empty array and set "answer" to 0. Respond ONLY with the JSON object.'
      ],
      responseMimeType: "application/json",
      temperature: 0.2,
      maxOutputTokens: 1024
    });
    const questions = normalizeGeminiQuestions(geminiResponse, mode, count);
    if (!questions.length) {
      return {
        success: true,
        docId: body.docId,
        created: 0
      };
    }
    const sectionTitle = ((_b = body.sectionTitle) == null ? void 0 : _b.trim()) || doc.title || doc.course || "Generated Section";
    const rows = questions.map((question) => ({
      id: randomUUID(),
      doc_id: body.docId,
      section_topic: sectionTitle,
      stem: question.stem,
      options: question.options,
      correct: question.correct,
      explanation: question.explanation
    }));
    const { error: insertError } = await supabase.from("questions").insert(rows);
    if (insertError) {
      console.error("Failed to insert generated questions", insertError);
      throw createError({
        statusCode: 500,
        statusMessage: "Could not store generated questions."
      });
    }
    return {
      success: true,
      docId: body.docId,
      created: rows.length
    };
  } catch (err) {
    if (err == null ? void 0 : err.statusCode) {
      throw err;
    }
    console.error("Question batch generation failed", err);
    throw createError({
      statusCode: 500,
      statusMessage: (err == null ? void 0 : err.statusMessage) || (err == null ? void 0 : err.message) || "Failed to generate section questions."
    });
  }
});
function normalizeGeminiQuestions(payload, mode, limit) {
  var _a, _b, _c;
  const rawQuestions = Array.isArray(payload == null ? void 0 : payload.questions) ? payload.questions : Array.isArray(payload) ? payload : [];
  const normalized = [];
  for (const raw of rawQuestions) {
    const stemCandidate = typeof (raw == null ? void 0 : raw.stem) === "string" ? raw.stem : typeof (raw == null ? void 0 : raw.question) === "string" ? raw.question : typeof (raw == null ? void 0 : raw.prompt) === "string" ? raw.prompt : "";
    const stem = stemCandidate.trim();
    if (!stem) continue;
    const explanation = typeof (raw == null ? void 0 : raw.explanation) === "string" && raw.explanation.trim().length ? raw.explanation.trim() : null;
    const options = mode === "mcq" ? sanitizeOptions(Array.isArray(raw == null ? void 0 : raw.options) ? raw.options : (raw == null ? void 0 : raw.choices) || []) : [];
    if (mode === "mcq" && options.length < 2) {
      continue;
    }
    const answerValue = (_c = (_b = (_a = raw == null ? void 0 : raw.answer) != null ? _a : raw == null ? void 0 : raw.correct) != null ? _b : raw == null ? void 0 : raw.correctIndex) != null ? _c : raw == null ? void 0 : raw.answerIndex;
    let correct = -1;
    if (mode === "mcq") {
      if (typeof answerValue === "number") {
        correct = clamp(answerValue, 0, options.length - 1);
      } else if (typeof answerValue === "string") {
        const idx = options.findIndex(
          (option) => option.toLowerCase() === answerValue.trim().toLowerCase()
        );
        correct = idx >= 0 ? idx : 0;
      } else {
        correct = 0;
      }
    }
    normalized.push({
      stem,
      options,
      correct,
      explanation
    });
    if (normalized.length >= limit) {
      break;
    }
  }
  return normalized;
}
function sanitizeOptions(values) {
  return values.map(
    (value) => typeof value === "string" ? value.trim() : typeof value === "number" ? String(value) : ""
  ).filter((value) => value.length > 0).slice(0, 5);
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

const generate_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: generate_post
}, Symbol.toStringTag, { value: 'Module' }));

const ingest_post = defineEventHandler(async (event) => {
  var _a, _b;
  const config = useRuntimeConfig();
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.docId)) {
    throw createError({ statusCode: 400, statusMessage: "docId required" });
  }
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: "Auth required" });
  }
  const supabase = createServiceClient();
  const { data: doc, error: docError } = await supabase.from("documents").select("user_id, storage_path, course").eq("id", body.docId).maybeSingle();
  if (docError) {
    throw createError({ statusCode: 500, statusMessage: docError.message });
  }
  if (!doc || doc.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: "Not your doc" });
  }
  const storagePath = doc.storage_path || body.storagePath;
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";
  if (!storagePath && !sourceUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing storage path for document"
    });
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  await supabase.from("documents").update({ status: "processing", error_message: null, updated_at: now }).eq("id", body.docId);
  try {
    let buffer;
    if (sourceUrl) {
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        throw createError({
          statusCode: 400,
          statusMessage: "Failed to download document from sourceUrl."
        });
      }
      buffer = Buffer.from(await response.arrayBuffer());
    } else if (storagePath) {
      const { data, error } = await supabase.storage.from("docs").download(storagePath);
      if (error || !data) {
        throw createError({
          statusCode: 400,
          statusMessage: (error == null ? void 0 : error.message) || "Download failed"
        });
      }
      buffer = Buffer.from(await data.arrayBuffer());
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: "No document source provided."
      });
    }
    const pages = await extractPdfPages(buffer);
    const chunks = chunkPages(pages);
    await supabase.from("doc_chunks").delete().eq("doc_id", body.docId);
    const rows = [];
    if (chunks.length) {
      const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
      const fallbackLength = ((_a = embeddings[0]) == null ? void 0 : _a.length) || 16;
      chunks.forEach((chunk, index) => {
        const vector = embeddings[index];
        rows.push({
          doc_id: body.docId,
          page: chunk.page,
          content: chunk.content,
          embedding: Array.isArray(vector) && vector.length ? vector : new Array(fallbackLength).fill(0)
        });
      });
      const INSERT_BATCH = 200;
      for (let i = 0; i < rows.length; i += INSERT_BATCH) {
        const batch = rows.slice(i, i + INSERT_BATCH);
        const { error: insertError } = await supabase.from("doc_chunks").insert(batch);
        if (insertError) {
          throw createError({
            statusCode: 500,
            statusMessage: insertError.message
          });
        }
      }
    }
    await supabase.from("documents").update({
      status: "ready",
      pages_count: pages.length,
      chunks_count: rows.length,
      error_message: null,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", body.docId);
    if (!config.geminiDisabled) {
      await seedQuestionsForDocument({
        docId: body.docId,
        courseName: doc.course,
        chunks
      });
    }
    const embeddingProvider = ((_b = config.public) == null ? void 0 : _b.embeddingProvider) || "gemini";
    return {
      success: true,
      docId: body.docId,
      chunkCount: rows.length,
      pageCount: pages.length,
      embeddedWith: embeddingProvider
    };
  } catch (err) {
    await supabase.from("documents").update({
      status: "failed",
      error_message: ((err == null ? void 0 : err.statusMessage) || (err == null ? void 0 : err.message) || "Ingest failed").slice(0, 280),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", body.docId);
    throw err;
  }
});
async function seedQuestionsForDocument(params) {
  const { docId, courseName, chunks } = params;
  if (!Array.isArray(chunks) || !chunks.length) return;
  const sectionTexts = buildSectionTexts(chunks);
  if (!sectionTexts.length) return;
  for (let index = 0; index < sectionTexts.length; index += 1) {
    const sectionText = sectionTexts[index];
    const text = sectionText.trim();
    if (!text) continue;
    const sectionTitle = (courseName ? `${courseName} ` : "") + `Section ${index + 1}`;
    try {
      await callQuestionGenWithRetry({
        docId,
        context: text,
        sectionTitle,
        count: 5,
        mode: "mcq"
      });
    } catch (err) {
      console.error("Failed to generate questions for section", docId, err);
    }
  }
  console.log(`Seeded ${sectionTexts.length} question batches for`, docId);
}
async function callQuestionGenWithRetry(body) {
  var _a, _b, _c;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await $fetch("/api/questions/generate", {
        method: "POST",
        body
      });
      return;
    } catch (err) {
      const status = (err == null ? void 0 : err.statusCode) || ((_a = err == null ? void 0 : err.response) == null ? void 0 : _a.status);
      const msg = (err == null ? void 0 : err.statusMessage) || ((_c = (_b = err == null ? void 0 : err.data) == null ? void 0 : _b.error) == null ? void 0 : _c.message) || (err == null ? void 0 : err.message) || "";
      const is503 = status === 503 || /model is overloaded/i.test(msg) || /UNAVAILABLE/i.test(msg);
      if (!is503 || attempt === maxAttempts) {
        throw err;
      }
      const delayMs = attempt * 2e3;
      console.warn(
        `Gemini 503 on attempt ${attempt} for doc ${body.docId}, retrying in ${delayMs}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
function buildSectionTexts(chunks) {
  const MAX_SECTIONS = 3;
  const MAX_CHARS_PER_SECTION = 3e3;
  const MAX_CHUNKS_PER_SECTION = 2;
  const sorted = chunks.slice().sort((a, b) => a.page - b.page);
  const sectionTexts = [];
  let current = [];
  let currentLen = 0;
  for (const chunk of sorted) {
    if (sectionTexts.length >= MAX_SECTIONS) break;
    const text = (chunk.content || "").trim();
    if (!text) continue;
    const exceedsCharLimit = currentLen + text.length > MAX_CHARS_PER_SECTION;
    const exceedsChunkLimit = current.length >= MAX_CHUNKS_PER_SECTION;
    if (current.length > 0 && (exceedsCharLimit || exceedsChunkLimit)) {
      sectionTexts.push(current.join("\n\n"));
      if (sectionTexts.length >= MAX_SECTIONS) break;
      current = [];
      currentLen = 0;
    }
    current.push(text);
    currentLen += text.length;
  }
  if (current.length && sectionTexts.length < MAX_SECTIONS) {
    sectionTexts.push(current.join("\n\n"));
  }
  return sectionTexts.slice(0, MAX_SECTIONS);
}

const ingest_post$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: ingest_post
}, Symbol.toStringTag, { value: 'Module' }));

function renderPayloadJsonScript(opts) {
  const contents = opts.data ? stringify(opts.data, opts.ssrContext._payloadReducers) : "";
  const payload = {
    "type": "application/json",
    "innerHTML": contents,
    "data-nuxt-data": appId,
    "data-ssr": !(opts.ssrContext.noSSR)
  };
  {
    payload.id = "__NUXT_DATA__";
  }
  if (opts.src) {
    payload["data-src"] = opts.src;
  }
  const config = uneval(opts.ssrContext.config);
  return [
    payload,
    {
      innerHTML: `window.__NUXT__={};window.__NUXT__.config=${config}`
    }
  ];
}

const renderSSRHeadOptions = {"omitLineBreaks":false};

globalThis.__buildAssetsURL = buildAssetsURL;
globalThis.__publicAssetsURL = publicAssetsURL;
const HAS_APP_TELEPORTS = !!(appTeleportAttrs.id);
const APP_TELEPORT_OPEN_TAG = HAS_APP_TELEPORTS ? `<${appTeleportTag}${propsToString(appTeleportAttrs)}>` : "";
const APP_TELEPORT_CLOSE_TAG = HAS_APP_TELEPORTS ? `</${appTeleportTag}>` : "";
const renderer = defineRenderHandler(async (event) => {
  const nitroApp = useNitroApp();
  const ssrError = event.path.startsWith("/__nuxt_error") ? getQuery$1(event) : null;
  if (ssrError && !("__unenv__" in event.node.req)) {
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found: /__nuxt_error"
    });
  }
  const ssrContext = createSSRContext(event);
  const headEntryOptions = { mode: "server" };
  ssrContext.head.push(appHead, headEntryOptions);
  if (ssrError) {
    ssrError.statusCode &&= Number.parseInt(ssrError.statusCode);
    setSSRError(ssrContext, ssrError);
  }
  const routeOptions = getRouteRules(event);
  if (routeOptions.ssr === false) {
    ssrContext.noSSR = true;
  }
  const renderer = await getRenderer(ssrContext);
  const _rendered = await renderer.renderToString(ssrContext).catch(async (error) => {
    if (ssrContext._renderResponse && error.message === "skipping render") {
      return {};
    }
    const _err = !ssrError && ssrContext.payload?.error || error;
    await ssrContext.nuxt?.hooks.callHook("app:error", _err);
    throw _err;
  });
  const inlinedStyles = [];
  await ssrContext.nuxt?.hooks.callHook("app:rendered", { ssrContext, renderResult: _rendered });
  if (ssrContext._renderResponse) {
    return ssrContext._renderResponse;
  }
  if (ssrContext.payload?.error && !ssrError) {
    throw ssrContext.payload.error;
  }
  const NO_SCRIPTS = routeOptions.noScripts;
  const { styles, scripts } = getRequestDependencies(ssrContext, renderer.rendererContext);
  if (ssrContext._preloadManifest && !NO_SCRIPTS) {
    ssrContext.head.push({
      link: [
        { rel: "preload", as: "fetch", fetchpriority: "low", crossorigin: "anonymous", href: buildAssetsURL(`builds/meta/${ssrContext.runtimeConfig.app.buildId}.json`) }
      ]
    }, { ...headEntryOptions, tagPriority: "low" });
  }
  if (inlinedStyles.length) {
    ssrContext.head.push({ style: inlinedStyles });
  }
  const link = [];
  for (const resource of Object.values(styles)) {
    if ("inline" in getQuery(resource.file)) {
      continue;
    }
    link.push({ rel: "stylesheet", href: renderer.rendererContext.buildAssetsURL(resource.file), crossorigin: "" });
  }
  if (link.length) {
    ssrContext.head.push({ link }, headEntryOptions);
  }
  if (!NO_SCRIPTS) {
    ssrContext.head.push({
      link: getPreloadLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      link: getPrefetchLinks(ssrContext, renderer.rendererContext)
    }, headEntryOptions);
    ssrContext.head.push({
      script: renderPayloadJsonScript({ ssrContext, data: ssrContext.payload }) 
    }, {
      ...headEntryOptions,
      // this should come before another end of body scripts
      tagPosition: "bodyClose",
      tagPriority: "high"
    });
  }
  if (!routeOptions.noScripts) {
    const tagPosition = "head";
    ssrContext.head.push({
      script: Object.values(scripts).map((resource) => ({
        type: resource.module ? "module" : null,
        src: renderer.rendererContext.buildAssetsURL(resource.file),
        defer: resource.module ? null : true,
        // if we are rendering script tag payloads that import an async payload
        // we need to ensure this resolves before executing the Nuxt entry
        tagPosition,
        crossorigin: ""
      }))
    }, headEntryOptions);
  }
  const { headTags, bodyTags, bodyTagsOpen, htmlAttrs, bodyAttrs } = await renderSSRHead(ssrContext.head, renderSSRHeadOptions);
  const htmlContext = {
    htmlAttrs: htmlAttrs ? [htmlAttrs] : [],
    head: normalizeChunks([headTags]),
    bodyAttrs: bodyAttrs ? [bodyAttrs] : [],
    bodyPrepend: normalizeChunks([bodyTagsOpen, ssrContext.teleports?.body]),
    body: [
      replaceIslandTeleports(ssrContext, _rendered.html) ,
      APP_TELEPORT_OPEN_TAG + (HAS_APP_TELEPORTS ? joinTags([ssrContext.teleports?.[`#${appTeleportAttrs.id}`]]) : "") + APP_TELEPORT_CLOSE_TAG
    ],
    bodyAppend: [bodyTags]
  };
  await nitroApp.hooks.callHook("render:html", htmlContext, { event });
  return {
    body: renderHTMLDocument(htmlContext),
    statusCode: getResponseStatus(event),
    statusMessage: getResponseStatusText(event),
    headers: {
      "content-type": "text/html;charset=utf-8",
      "x-powered-by": "Nuxt"
    }
  };
});
function normalizeChunks(chunks) {
  return chunks.filter(Boolean).map((i) => i.trim());
}
function joinTags(tags) {
  return tags.join("");
}
function joinAttrs(chunks) {
  if (chunks.length === 0) {
    return "";
  }
  return " " + chunks.join(" ");
}
function renderHTMLDocument(html) {
  return `<!DOCTYPE html><html${joinAttrs(html.htmlAttrs)}><head>${joinTags(html.head)}</head><body${joinAttrs(html.bodyAttrs)}>${joinTags(html.bodyPrepend)}${joinTags(html.body)}${joinTags(html.bodyAppend)}</body></html>`;
}

const renderer$1 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: renderer
}, Symbol.toStringTag, { value: 'Module' }));
//# sourceMappingURL=index.mjs.map
