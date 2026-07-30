import MoodSelector from "@/components/mood/MoodSelector";

export default function Home() {
  return (
    <section>
      <MoodSelector selected={null} onSelect={() => {}} />
    </section>
  );
}
