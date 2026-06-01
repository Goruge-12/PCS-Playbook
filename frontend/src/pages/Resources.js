import { useEffect, useState } from 'react';
import api from '../services/api';

function Resources() {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    api
      .get('/resources')
      .then((res) => setResources(res.data))
      .catch(() => setResources([]));
  }, []);

  const groupedResources = resources.reduce((groups, item) => {
    const category = item.category || 'Other';

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(item);
    return groups;
  }, {});

  return (
    <section className="resources-page">
      {Object.keys(groupedResources).map((category) => (
        <div className="resource-section" key={category}>
          <h3>{category}</h3>

          <div className="resource-list">
            {groupedResources[category].map((item) => (
              <p key={item.resource_id}>
                <a
                  href={item.website_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.title}
                </a>

                {item.description && (
                  <>
                    {' '} - {item.description}
                  </>
                )}
              </p>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

export default Resources;