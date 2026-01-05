'use client';

import { DiscussionEmbed } from 'disqus-react';
import { SITE_CONFIG } from '@/lib/constants';

interface CommentsProps {
  slug: string;
  title: string;
}

export default function Comments({ slug, title }: CommentsProps) {
  const disqusConfig = {
    url: `${SITE_CONFIG.url}/posts/${slug}`,
    identifier: slug,
    title: title,
  };

  return (
    <div className="mt-12">
      <DiscussionEmbed
        shortname={SITE_CONFIG.disqusShortname}
        config={disqusConfig}
      />
    </div>
  );
}
