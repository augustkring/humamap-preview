import { faqs } from "@/content/site";

export function Faq() {
  return (
    <div className="faq-list">
      {faqs.map((item) => (
        <details key={item.question} className="faq-item">
          <summary>{item.question}<span aria-hidden="true">+</span></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
