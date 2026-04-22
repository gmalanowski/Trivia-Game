import { Hono } from "hono";
import { fetchCategories } from "../lib/opentdb";

const categories = new Hono();

categories.get("/", async (c) => {
  try {
    const data = await fetchCategories();
    return c.json(data, 200);
  } catch (error) {
    console.error("OpenTDB Categories API Error:", error);
    return c.json(
      { error: "An unexpected error occurred while fetching categories." },
      500,
    );
  }
});

export default categories;