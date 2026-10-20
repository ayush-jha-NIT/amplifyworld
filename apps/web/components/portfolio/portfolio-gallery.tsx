"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import {
  portfolioCategories,
  portfolioProjects
} from "./portfolio-data";
import type { PortfolioCategory, PortfolioProject } from "./portfolio-data";

function ProjectArtwork({
  project,
  className = "",
  sizes = "(max-width: 850px) 84vw, 58vw"
}: {
  project: PortfolioProject;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={"portfolio-media-unavailable " + className} role="img" aria-label={"Illustration unavailable for " + project.title}>
        <Image src="/design/icons/empty.svg" alt="" width={42} height={42} />
        <span>Illustration unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={project.image}
      alt={project.imageAlt}
      width={1200}
      height={800}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function PortfolioGallery() {
  const [category, setCategory] = useState<PortfolioCategory>("All");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<PortfolioProject | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const filtered = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    return portfolioProjects.filter((project) => {
      if (category !== "All" && project.category !== category) return false;
      if (!normalized) return true;
      return [
        project.title,
        project.category,
        project.summary,
        ...project.services
      ].join(" ").toLocaleLowerCase().includes(normalized);
    });
  }, [category, search]);

  const index = Math.max(0, filtered.findIndex((item) => item.id === activeId));
  const activeProject = filtered[index] ?? null;

  const goTo = (nextIndex: number) => {
    if (filtered.length <= 1) return;
    const at = (nextIndex + filtered.length) % filtered.length;
    const next = filtered[at];
    if (next) setActiveId(next.id);
  };

  const move = (direction: number) => goTo(index + direction);

  const changeCategory = (next: PortfolioCategory) => {
    setCategory(next);
    setActiveId("");
  };

  const openDetails = (project: PortfolioProject, opener: HTMLElement) => {
    returnFocus.current = opener;
    setSelectedDetail(project);
  };

  useEffect(() => {
    if (selectedDetail && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [selectedDetail]);

  const finishDialog = () => {
    setSelectedDetail(null);
    const opener = returnFocus.current;
    returnFocus.current = null;
    if (opener?.isConnected) opener.focus();
  };

  const onCarouselKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
    }
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const point = event.touches[0];
    if (point) swipeStart.current = { x: point.clientX, y: point.clientY };
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const starting = swipeStart.current;
    swipeStart.current = null;
    const end = event.changedTouches[0];
    if (!starting || !end) return;
    const deltaX = end.clientX - starting.x;
    const deltaY = end.clientY - starting.y;
    // Do not interfere with vertical scrolling.
    if (Math.abs(deltaX) >= 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
      move(deltaX < 0 ? 1 : -1);
    }
  };

  return (
    <section className="portfolio-browser content-shell" id="projects" aria-labelledby="portfolio-browser-title">
      <div className="portfolio-browser-heading">
        <div>
          <p className="eyebrow">Concept gallery</p>
          <h2 id="portfolio-browser-title">Explore the <span className="gradient-text">Possibilities.</span></h2>
        </div>
        <p>Each artwork is a design concept, not a completed client project or a claim of results.</p>
      </div>

      <div className="portfolio-filterbar" aria-label="Filter projects">
        <div className="portfolio-filters" role="group" aria-label="Project category">
          {portfolioCategories.map((item) => (
            <button
              key={item}
              type="button"
              className={"portfolio-filter" + (category === item ? " is-active" : "")}
              aria-pressed={category === item}
              onClick={() => changeCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="portfolio-search">
          <Image src="/design/icons/search.svg" width={18} height={18} alt="" />
          <span className="sr-only">Search projects</span>
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setActiveId(""); }}
            placeholder="Search concepts"
            aria-label="Search projects"
          />
        </label>
      </div>

      <p className="portfolio-result-count" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "concept" : "concepts"} found
      </p>

      {activeProject ? (
        <div className="portfolio-browser-layout">
          <div className="portfolio-selected-copy">
            <span className="portfolio-concept-tag">Concept / Placeholder</span>
            <p className="portfolio-selected-category">{activeProject.category}</p>
            <h3>{activeProject.title}</h3>
            <p>{activeProject.summary}</p>
            <button
              type="button"
              className="portfolio-primary-action"
              onClick={(event) => openDetails(activeProject, event.currentTarget)}
            >
              Explore Concept <span aria-hidden="true">↗</span>
            </button>
            <div className="portfolio-count-indicator" aria-hidden="true">
              <strong>{String(index + 1).padStart(2, "0")}</strong>
              <span>/ {String(filtered.length).padStart(2, "0")}</span>
            </div>
          </div>
          <div className="portfolio-carousel-shell">
            <div
              className="portfolio-stage"
              role="region"
              aria-roledescription="carousel"
              aria-label="Portfolio concepts. Use the arrow keys or previous and next buttons."
              tabIndex={0}
              onKeyDown={onCarouselKey}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
            >
              {filtered.map((project, projectIndex) => {
                const relative = (projectIndex - index + filtered.length) % filtered.length;
                const position = relative === 0 ? "active" :
                  relative === 1 ? "next" :
                  relative === filtered.length - 1 ? "previous" : "offstage";
                return (
                  <div
                    key={project.id}
                    className={"portfolio-stage-card portfolio-card-" + position}
                    data-position={position}
                    aria-hidden="true"
                  >
                    <div className="portfolio-stage-image">
                      <ProjectArtwork project={project} sizes="(max-width: 639px) 84vw, 60vw" />
                    </div>
                    <div className="portfolio-stage-caption">
                      <span>Concept / Placeholder</span>
                      <strong>{project.title}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="portfolio-carousel-controls">
              <button
                type="button"
                className="portfolio-round-control"
                aria-label="Previous concept"
                onClick={() => move(-1)}
                disabled={filtered.length < 2}
              >
                <span aria-hidden="true">←</span>
              </button>
              <div className="portfolio-indicators" role="group" aria-label="Choose a concept">
                {filtered.map((project, position) => (
                  <button
                    key={project.id}
                    type="button"
                    className={position === index ? "is-active" : ""}
                    aria-label={"Show " + project.title}
                    aria-current={position === index ? "true" : undefined}
                    onClick={() => goTo(position)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="portfolio-round-control"
                aria-label="Next concept"
                onClick={() => move(1)}
                disabled={filtered.length < 2}
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
            <p className="sr-only" aria-live="polite" aria-atomic="true">
              {activeProject.title}, concept {index + 1} of {filtered.length}
            </p>
          </div>
          <div className="portfolio-mini-rail" aria-label="Select a concept">
            {filtered.map((project, position) => (
              <button
                key={project.id}
                className={"portfolio-mini-item" + (position === index ? " is-selected" : "")}
                type="button"
                aria-pressed={position === index}
                onClick={() => goTo(position)}
              >
                <span className="portfolio-mini-image"><ProjectArtwork project={project} sizes="100px" /></span>
                <span>
                  <span className="portfolio-mini-concept">Concept</span>
                  <strong>{project.title}</strong>
                  <small>{project.category}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="portfolio-empty" role="status">
          <Image src="/design/icons/empty.svg" alt="" width={48} height={48} />
          <h3>No matching concepts</h3>
          <p>Try a different category or search term. Published client projects will be added once verified.</p>
          <button
            className="portfolio-secondary-action"
            type="button"
            onClick={() => { setCategory("All"); setSearch(""); setActiveId(""); }}
          >Clear filters</button>
        </div>
      )}

      <p className="portfolio-disclosure">
        <strong>Concept / Placeholder:</strong> The visuals are illustrative design studies. No client relationship,
        completed work, results, live preview or testimonial is implied.
      </p>

      {selectedDetail && (
        <dialog
          className="portfolio-detail-dialog"
          ref={dialogRef}
          onClose={finishDialog}
          aria-labelledby="portfolio-detail-title"
          aria-describedby="portfolio-detail-desc"
          onClick={(event) => {
            if (event.target === dialogRef.current) dialogRef.current?.close();
          }}
        >
          <div className="portfolio-dialog-panel">
            <button
              className="portfolio-dialog-close"
              type="button"
              aria-label="Close project details"
              autoFocus
              onClick={() => dialogRef.current?.close()}
            >×</button>
            <div className="portfolio-dialog-media">
              <ProjectArtwork project={selectedDetail} sizes="(max-width: 850px) 90vw, 600px" />
            </div>
            <div className="portfolio-dialog-body">
              <span className="portfolio-concept-tag">Concept / Placeholder</span>
              <p className="portfolio-selected-category">{selectedDetail.category}</p>
              <h2 id="portfolio-detail-title">{selectedDetail.title}</h2>
              <p id="portfolio-detail-desc">{selectedDetail.objective}</p>
              <h3>Concept scope</h3>
              <ul className="portfolio-scope">
                {selectedDetail.services.map((service) => <li key={service}>{service}</li>)}
              </ul>
              <h3>Creative approach</h3>
              <ul className="portfolio-approach">
                {selectedDetail.approach.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <p className="portfolio-dialog-disclaimer">
                This is an illustrative concept, not evidence of a delivered client engagement or measured outcome.
              </p>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
