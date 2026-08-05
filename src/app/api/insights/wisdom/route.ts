import { NextResponse } from "next/server";

const WISDOM_QUOTES = [
  {
    quote:
      "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Viktor E. Frankl",
  },
  {
    quote: "You can't stop the waves, but you can learn to surf.",
    author: "Jon Kabat-Zinn",
  },
  {
    quote:
      "The soul should always stand ajar, ready to welcome the ecstatic experience.",
    author: "Emily Dickinson",
  },
  {
    quote:
      "Owning our story and loving ourselves through that process is the bravest thing that we will ever do.",
    author: "Brené Brown",
  },
];

export async function GET() {
  const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  const selected = WISDOM_QUOTES[weekNumber % WISDOM_QUOTES.length];
  return NextResponse.json(selected);
}
