import { Panel } from "./Panel";

const STATUS_DOT: Record<string, string> = {
  running: "bg-accent animate-pulse",
  queued: "bg-muted",
  review: "bg-warn",
};

export function SimpleList({
  title,
  items,
}: {
  title: string;
  items: { title: string; meta?: string; status?: keyof typeof STATUS_DOT }[];
}) {
  return (
    <Panel title={title}>
      <ul className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.title} className="flex items-center gap-2 text-sm">
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                item.status ? STATUS_DOT[item.status] : "bg-good"
              }`}
            />
            <span className="flex-1">{item.title}</span>
            {item.meta && <span className="text-xs text-muted">{item.meta}</span>}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
