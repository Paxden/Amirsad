import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";

const PageHeader = ({ title, breadcrumbs, actions }) => {
  return (
    <div className="page-header">
      <div className="page-header-left">
        <h2 className="page-title">{title}</h2>
        {breadcrumbs && (
          <Breadcrumb>
            {breadcrumbs.map((item, index) => (
              <Breadcrumb.Item
                key={index}
                linkAs={Link}
                linkProps={{ to: item.path }}
                active={index === breadcrumbs.length - 1}
              >
                {item.label}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .page-header-actions {
          display: flex;
          gap: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default PageHeader;