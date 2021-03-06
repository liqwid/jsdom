"use strict";

const { assert } = require("chai");
const { describe, specify } = require("mocha-sugar-free");

const jsdom = require("../../lib/old-api.js");

describe("location", () => {
  specify("window.location and document.location should be equal", () => {
    const window = jsdom.jsdom().defaultView;

    assert.strictEqual(window.document.location, window.location);
  });

  specify("window.location.href for a default window is about:blank", () => {
    const window = jsdom.jsdom().defaultView;

    assert.equal(window.location.href, "about:blank");
  });

  specify("window.location.port for an about:blank window", () => {
    const window = jsdom.jsdom().defaultView;

    assert.equal(window.location.port, "");
  });

  specify("window.location.hash is manipulable", () => {
    const window = jsdom.jsdom("", {
      url: "http://www.example.com"
    }).defaultView;
    const defaultHref = window.location.href;

    assert.equal(window.location.hash, "");

    window.location.href += "#foobar";
    assert.equal(window.location.hash, "#foobar");

    window.location.hash = "#baz";
    assert.equal(window.location.hash, "#baz");
    assert.equal(window.location.href, defaultHref + "#baz");
  });

  specify(
    "window.location.hash is manipulable even for about:blank (GH-1289)",
    () => {
      const window = jsdom.jsdom("", {
        url: "about:blank"
      }).defaultView;

      assert.equal(window.location.hash, "");

      window.location.hash = "#baz";
      assert.equal(window.location.hash, "#baz");
      assert.equal(window.location.href, "about:blank#baz");
    }
  );

  specify(
    "when changing window.location.href by adding a hash, should fire a hashchange event",
    t => {
      const window = jsdom.jsdom("", {
        url: "http://www.example.com"
      }).defaultView;
      window.addEventListener("hashchange", event => {
        assert.strictEqual(event.bubbles, true);
        assert.strictEqual(event.cancelable, false);
        assert.strictEqual(event.oldURL, "http://www.example.com/");
        assert.strictEqual(event.newURL, "http://www.example.com/#foo");

        assert.ok(true, "hashchange event was fired");
        t.done();
      });

      window.location.href += "#foo";
    },
    {
      async: true
    }
  );

  specify(
    "when changing window.location.hash directly, should fire a hashchange event",
    t => {
      const window = jsdom.jsdom("", {
        url: "http://www.example.com"
      }).defaultView;
      window.addEventListener("hashchange", event => {
        assert.strictEqual(event.bubbles, true);
        assert.strictEqual(event.cancelable, false);
        assert.strictEqual(event.oldURL, "http://www.example.com/");
        assert.strictEqual(event.newURL, "http://www.example.com/#foo");

        assert.ok(true, "hashchange event was fired");
        t.done();
      });

      window.location.hash = "#foo";
    },
    {
      async: true
    }
  );

  specify("window.location components are correct", () => {
    const window = jsdom.jsdom("", {
      url: "http://www.example.com:1234/path/to/foo.txt?blahblah#hash"
    }).defaultView;

    assert.strictEqual(window.location.href, "http://www.example.com:1234/path/to/foo.txt?blahblah#hash");
    assert.strictEqual(window.location.origin, "http://www.example.com:1234");
    assert.strictEqual(window.location.protocol, "http:");
    assert.strictEqual(window.location.host, "www.example.com:1234");
    assert.strictEqual(window.location.hostname, "www.example.com");
    assert.strictEqual(window.location.port, "1234");
    assert.strictEqual(window.location.pathname, "/path/to/foo.txt");
    assert.strictEqual(window.location.search, "?blahblah");
    assert.strictEqual(window.location.hash, "#hash");
  });
});
