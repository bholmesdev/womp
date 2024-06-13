import { sequence } from "astro:middleware";
import { user } from "./user";
import { co2 } from "./co2";

export const onRequest = sequence(user, co2);
