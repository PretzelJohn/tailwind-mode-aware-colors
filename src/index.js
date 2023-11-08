const plugin = require("tailwindcss/plugin");
const Color = require("color");

// from tailwindcss src/util/flattenColorPalette
const flattenColorPalette = (colors) =>
  Object.assign(
    {},
    ...Object.entries(colors ?? {}).flatMap(([color, values]) =>
      typeof values == "object"
        ? Object.entries(flattenColorPalette(values)).map(([number, hex]) => ({
            [color + (number === "DEFAULT" ? "" : `-${number}`)]: hex,
          }))
        : [{ [`${color}`]: values }]
    )
  );

const processColors = (
  palette,
  styles,
  { usesMediaStrategy, darkSelector, lightId, darkId, variablePrefix = "" }
) => {
  const colors = flattenColorPalette(palette);

  Object.keys(colors).forEach((colorName) => {
    const match = colorName.match(
      new RegExp(`^(?:(.+)-)?${lightId}(?:-(.+))?$`)
    );

    if (match) {
      const prefix = match[1];
      const suffix = match[2];
      const modeAwareColorName = [prefix, suffix].filter((x) => x).join("-");

      const lightColor = colors[colorName];
      const darkColor =
        colors[[prefix, darkId, suffix].filter((x) => x).join("-")];

      if (lightColor && darkColor) {
        if (colors[modeAwareColorName]) {
          throw `withModeAwareColors plugin error: adding the '${modeAwareColorName}' mode-aware color would overwrite an existing color.`;
        } else {
          const varName = `--color-${
            variablePrefix ? `${variablePrefix}-` : ""
          }${modeAwareColorName}`;
          colors[modeAwareColorName] = `rgb(var(${varName}) / <alpha-value>)`;

          const lightStyle = Color(lightColor).rgb().array().join(" ");
          const darkStyle = Color(darkColor).rgb().array().join(" ");

          styles.html[varName] = lightStyle;
          if (usesMediaStrategy) {
            styles["@media (prefers-color-scheme: dark)"].html[varName] =
              darkStyle;
          } else {
            styles[darkSelector][varName] = darkStyle;
          }
        }
      }
    }
  });

  return { colors, styles };
};

module.exports = (
  config,
  { lightId, darkId } = { lightId: "light", darkId: "dark" }
) => {
  const usesMediaStrategy = Array.isArray(config.darkMode)
    ? config.darkMode[0] !== "class"
    : config.darkMode !== "class";
  const darkSelector =
    !usesMediaStrategy &&
    (Array.isArray(config.darkMode) ? config.darkMode[1] || ".dark" : ".dark");

  const styles = {
    html: {},
    ...(usesMediaStrategy
      ? { "@media (prefers-color-scheme: dark)": { html: {} } }
      : { [darkSelector]: {} }),
  };

  const extendsDefaultColors = !config.theme.colors;

  const colors = extendsDefaultColors
    ? config.theme.extend.colors || {}
    : config.theme.colors;

  const processed = processColors(colors, styles, {
    usesMediaStrategy,
    darkSelector,
    lightId,
    darkId,
  });

  return {
    ...config,
    theme: extendsDefaultColors
      ? {
          ...config.theme,
          extend: { ...(config.theme.extend || {}), colors: processed.colors },
        }
      : { ...(config.theme || []), colors: processed.colors },
    plugins: [
      ...(config.plugins || []),
      plugin(({ addBase }) => addBase(styles)),
    ],
  };
};
