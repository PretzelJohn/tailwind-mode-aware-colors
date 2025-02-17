![Banner](https://raw.githubusercontent.com/JavierM42/tailwind-mode-aware-colors/main/image.png)

# tailwind-mode-aware-colors

Adds dynamic colors to TailwindCSS with light and dark shades that are shown based on the user's color scheme.

With this plugin, `bg-primary` can be used instead of `bg-primary-light dark:bg-primary-dark`.

## Installation & Usage

```
npm install --save-dev tailwind-mode-aware-colors
```

### `tailwind.config.js`

```js

module.exports = require('tailwind-mode-aware-colors')({
  // your usual config
  theme: {
    colors: {
      primary: {
        // colors defined with light and dark keys will be dynamic
        light: '#bbffa3',
        dark: '#144b00'
      }
      ...
    }
  }
  ...
});
```

Any pair of colors `X-light` and `X-dark` will yield a new color `X` that automatically adapts to the color scheme. You can also have `light-` and `dark-` as prefixes or even `-light-` and `-dark-` in the middle of it.

- Works with both `media` and `class` [dark mode strategies](https://tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually).

- The original colors will still exist, so you can use the static shades as well as the new dynamic one.

- Works with arbitrarily nested structures. For example, if you had `primary-surface-variant-light` and `primary-surface-variant-dark`, the plugin would generate `primary-surface-variant`.

- Works with `theme.extend.colors` too.

- Of course, you can still use `dark:`, `md:`, `hover:` and any other Tailwind modifiers.

- You can also use the plugin with scoped tailwind color configuration such as `textColor`, `backgroundColor`, `borderColor` or `outlineColor`.

- To hardcode opacity values in your tailwind config, you can use rgba `rgba(255, 255, 255, 0.2)` or hex `#ffffff33`

## Options

If for some reason `-light` and `-dark` are not right for your use case, you can pass an options object as a second parameter and customize the suffixes. Just replace `"light"` and `"dark"` with any other string.

```js
module.exports = require("tailwind-mode-aware-colors")(config, {
  lightId: "light",
  darkId: "dark",
});
```

## Why isn't the plugin called in the `plugins` array of `tailwind.config.js`?

`tailwind-mode-aware-colors` modifies your theme to add the new dynamic colors. The Tailwind engine and any other plugins you may be using will then pick those up. Because of that, it needs to wrap your Tailwind configuration and cannot be called in the plugins array.
