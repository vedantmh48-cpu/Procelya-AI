export default function Panel({ eyebrow, title, subtitle, actions, className = '', children }) {
  return <section className={`panel corner-clip ${className}`}>
    {(eyebrow || title || actions) && <header className="panel-head">
      <div><div className="eyebrow">{eyebrow}</div>{title && <h2>{title}</h2>}{subtitle && <p>{subtitle}</p>}</div>
      {actions && <div className="panel-actions">{actions}</div>}
    </header>}
    {children}
  </section>
}
