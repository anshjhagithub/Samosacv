/**
 * Export engine — client-side only, no heavy server processing.
 * .docx implemented; architecture allows PDF via alternate builder (e.g. docx + serverless PDF render or client lib).
 */

export { exportDocx, buildDocxDocument } from "./docx";
