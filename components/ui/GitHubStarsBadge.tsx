"use client";

import React, { useEffect, useState } from "react";
import { Github } from "lucide-react";

interface GitHubStarsBadgeProps {
  owner?: string;
  repo?: string;
  className?: string;
  showIcon?: boolean;
}

const GitHubStarsBadge: React.FC<GitHubStarsBadgeProps> = ({
  owner = "JellYouness",
  repo = "invoicrapp",
  className = "",
  showIcon = true,
}) => {
  const githubUrl = `https://github.com/${owner}/${repo}`;
  // Using shields.io for the star count badge
  const badgeUrl = `https://img.shields.io/github/stars/${owner}/${repo}?style=social&label=`;

  const [stars, setStars] = useState(0);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${owner}/${repo}`)
      .then(response => response.json())
      .then(data => setStars(data.stargazers_count))
      .catch(error => console.error('Error fetching stars:', error));
  }, [owner, repo]);

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-gray-500 text-sm font-medium transition-all duration-200 hover:scale-105 ${className}`}
      aria-label={`Star ${owner}/${repo} on GitHub`}
    >
      {showIcon && <Github className="w-4 h-4" />}
      {/* <img
        src={badgeUrl}
        alt={`GitHub stars for ${owner}/${repo}`}
        className="h-5"
        loading="lazy"
      /> */}
      {stars}
    </a>
  );
};

export default GitHubStarsBadge;
