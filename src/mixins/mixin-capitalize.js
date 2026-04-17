export const capitalizeMixin = {
  methods: {
    capitalize(text) {
      if (!text) return "";
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    capitalizeEachWord(text) {
      if (!text) return "";
      return text
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
    },
  },
};
