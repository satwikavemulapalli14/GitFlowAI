const PDFDocument = require('pdfkit');
const Review = require('../models/Review');

function parseCategories(review) {
  const categories = { bugs: [], security: [], performance: [], readability: [], maintainability: [], codeSmells: [] };
  try {
    if (review.raw_output) {
      const parsed = typeof review.raw_output === 'string' ? JSON.parse(review.raw_output) : review.raw_output;
      for (const key of Object.keys(categories)) {
        categories[key] = parsed[key] || [];
      }
    }
  } catch {}
  return categories;
}

const severityLabel = { critical: 'Critical', major: 'Major', minor: 'Minor' };

exports.exportPDF = async (req, res, next) => {
  try {
    const review = await Review.findByIdWithDetails(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const categories = parseCategories(review);
    const totalIssues = Object.values(categories).reduce((s, arr) => s + arr.length, 0);
    const doc = new PDFDocument({ margin: 50 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="review-${review.id}.pdf"`);
    doc.pipe(res);

    const primary = '#2563eb';
    const gray = '#6b7280';
    const bold = '#111827';

    function header(text, size, color) {
      doc.fontSize(size).font('Helvetica-Bold').fillColor(color).text(text, { underline: false });
    }

    function body(text, size, color) {
      doc.fontSize(size).font('Helvetica').fillColor(color).text(text);
    }

    // Title
    header('GitFlowAI - Code Review Report', 22, primary);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e5e7eb').stroke();
    doc.moveDown(0.5);

    // Metadata
    header('Repository', 11, gray);
    body(review.repo_full_name || `${review.repo_owner}/${review.repo_name}`, 11, bold);
    doc.moveDown(0.3);
    header('Pull Request', 11, gray);
    body(`#${review.pr_number} - ${review.pr_title || ''}`, 11, bold);
    doc.moveDown(0.3);
    header('Review Date', 11, gray);
    body(review.completed_at ? new Date(review.completed_at).toLocaleString() : 'N/A', 11, bold);
    doc.moveDown(0.3);
    header('Overall Score', 11, gray);
    body(review.score != null ? `${review.score}/100` : 'N/A', 11, bold);
    doc.moveDown(0.3);
    header('Total Issues', 11, gray);
    body(String(totalIssues), 11, bold);
    doc.moveDown(1);

    // Summary
    header('Summary', 14, primary);
    body(review.summary || 'No summary provided.', 10, bold);
    doc.moveDown(1);

    // Category issues
    const catLabels = {
      bugs: 'Bugs', security: 'Security', performance: 'Performance',
      readability: 'Readability', maintainability: 'Maintainability', codeSmells: 'Code Smells',
    };

    for (const [key, label] of Object.entries(catLabels)) {
      const issues = categories[key];
      if (!issues || issues.length === 0) continue;

      header(`${label} (${issues.length})`, 14, primary);
      doc.moveDown(0.3);

      for (const issue of issues) {
        const sev = severityLabel[issue.severity] || 'Minor';
        const sevColor = issue.severity === 'critical' ? '#dc2626' : issue.severity === 'major' ? '#ea580c' : '#ca8a04';
        const location = [issue.file, issue.line].filter(Boolean).join(':');

        header(`[${sev}] ${issue.problem || issue.message}`, 10, sevColor);
        if (location) body(`File: ${location}`, 9, gray);
        doc.moveDown(0.2);
        body(issue.message || issue.problem || '', 9, bold);
        if (issue.explanation) {
          doc.moveDown(0.1);
          body(`Explanation: ${issue.explanation}`, 9, gray);
        }
        doc.moveDown(0.5);
      }
    }

    // Suggested improvements
    const allIssues = Object.values(categories).flat();
    const withImprovements = allIssues.filter((i) => i.improvedCode);
    if (withImprovements.length > 0) {
      header('Suggested Improvements', 14, primary);
      doc.moveDown(0.3);
      for (const issue of withImprovements) {
        header(issue.problem || issue.message, 10, bold);
        doc.moveDown(0.2);
        body('Original:', 9, gray);
        body(issue.originalCode || 'N/A', 9, bold);
        doc.moveDown(0.1);
        body('Improved:', 9, gray);
        body(issue.improvedCode, 9, bold);
        doc.moveDown(0.5);
      }
    }

    doc.end();
  } catch (error) {
    next(error);
  }
};

exports.exportMarkdown = async (req, res, next) => {
  try {
    const review = await Review.findByIdWithDetails(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const categories = parseCategories(review);
    const totalIssues = Object.values(categories).reduce((s, arr) => s + arr.length, 0);
    const severityLabelMD = { critical: '🔴 Critical', major: '🟠 Major', minor: '🟡 Minor' };

    let md = `# GitFlowAI - Code Review Report\n\n`;
    md += `## Review Information\n\n`;
    md += `| Field | Value |\n`;
    md += `|-------|-------|\n`;
    md += `| **Repository** | ${review.repo_full_name || `${review.repo_owner}/${review.repo_name}`} |\n`;
    md += `| **Pull Request** | #${review.pr_number} - ${review.pr_title || ''} |\n`;
    md += `| **Review Date** | ${review.completed_at ? new Date(review.completed_at).toLocaleString() : 'N/A'} |\n`;
    md += `| **Overall Score** | ${review.score != null ? `${review.score}/100` : 'N/A'} |\n`;
    md += `| **Total Issues** | ${totalIssues} |\n\n`;

    md += `## Summary\n\n${review.summary || 'No summary provided.'}\n\n`;

    const catLabels = {
      bugs: 'Bugs', security: 'Security', performance: 'Performance',
      readability: 'Readability', maintainability: 'Maintainability', codeSmells: 'Code Smells',
    };

    for (const [key, label] of Object.entries(catLabels)) {
      const issues = categories[key];
      if (!issues || issues.length === 0) continue;

      md += `## ${label} (${issues.length})\n\n`;
      for (const issue of issues) {
        const sev = severityLabelMD[issue.severity] || '🟡 Minor';
        const location = [issue.file, issue.line].filter(Boolean).join(':');
        md += `### ${sev} - ${issue.problem || issue.message}\n\n`;
        if (location) md += `**File:** ${location}\n\n`;
        md += `${issue.message || issue.problem || ''}\n\n`;
        if (issue.explanation) md += `> **Explanation:** ${issue.explanation}\n\n`;
      }
    }

    const allIssues = Object.values(categories).flat();
    const withImprovements = allIssues.filter((i) => i.improvedCode);
    if (withImprovements.length > 0) {
      md += `## Suggested Improvements\n\n`;
      for (const issue of withImprovements) {
        md += `### ${issue.problem || issue.message}\n\n`;
        md += `**Original:**\n\`\`\`\n${issue.originalCode || 'N/A'}\n\`\`\`\n\n`;
        md += `**Improved:**\n\`\`\`\n${issue.improvedCode}\n\`\`\`\n\n`;
      }
    }

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="review-${review.id}.md"`);
    res.send(md);
  } catch (error) {
    next(error);
  }
};
