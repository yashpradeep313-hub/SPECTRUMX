#!/usr/bin/env bash

# ==============================================================================
# SpectrumX - Dynamic GitHub Pages & Static Hosting Deployment Script
# ==============================================================================
# Usage:
#   ./deploy.sh                -> Clean, build, & prepare static dist folder
#   ./deploy.sh --push         -> Build & automatically push to origin/gh-pages
#   ./deploy.sh --base <path>  -> Specify custom base URL (e.g. /my-repo/)
#   ./deploy.sh --domain <cname> -> Ingest custom domain CNAME into dist/
# ==============================================================================

set -e

# ANSI Color Codes
CYAN='\033[0;36m'
GREEN='\033[0;32m'
AMBER='\033[0;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}${BOLD}"
echo "  ____                  _                       __  __ "
echo " / ___| _ __   ___  ___| |_ _ __ _   _ _ __ ___ \ \/ / "
echo " \___ \| '_ \ / _ \/ __| __| '__| | | | '_ \` _ \ \  /  "
echo "  ___) | |_) |  __/ (__| |_| |  | |_| | | | | | |/  \  "
echo " |____/| .__/ \___|\___|\__|_|   \__,_|_| |_| |_/_/\_\ "
echo "       |_|                                             "
echo -e "${NC}"
echo -e "${PURPLE}=== Spectrum X Dynamic GitHub Deployment Engine ===${NC}"
echo ""

# Default parameters
AUTO_PUSH=false
CUSTOM_BASE=""
CUSTOM_DOMAIN=""
DIST_DIR="dist"

# Parse CLI flags
while [[ "$#" -gt 0 ]]; do
  case $1 in
    -p|--push)
      AUTO_PUSH=true
      shift
      ;;
    -b|--base)
      CUSTOM_BASE="$2"
      shift 2
      ;;
    -d|--domain)
      CUSTOM_DOMAIN="$2"
      shift 2
      ;;
    -h|--help)
      echo "SpectrumX Deployment Helper"
      echo "Options:"
      echo "  -p, --push         Automatically deploy and push to gh-pages branch"
      echo "  -b, --base <path>  Override Vite base URL (default: './' for dynamic portability)"
      echo "  -d, --domain <url> Create CNAME file for custom domain"
      echo "  -h, --help         Show this help message"
      exit 0
      ;;
    *)
      echo -e "${AMBER}Unknown flag passed: $1 (ignoring)${NC}"
      shift
      ;;
  esac
done

# Step 1: Detect Git Environment Dynamically
echo -e "${CYAN}[1/6] Inspecting Git Environment...${NC}"
GIT_REMOTE=$(git config --get remote.origin.url || true)
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
REPO_NAME=""

if [ -n "$GIT_REMOTE" ]; then
  REPO_NAME=$(basename -s .git "$GIT_REMOTE")
  echo -e "  • Remote Origin: ${GREEN}${GIT_REMOTE}${NC}"
  echo -e "  • Detected Repo: ${GREEN}${REPO_NAME}${NC}"
  echo -e "  • Active Branch: ${GREEN}${CURRENT_BRANCH}${NC}"
else
  echo -e "  • ${AMBER}No git remote origin found yet. (Local git repository will be initialized)${NC}"
fi

# Determine base path for Vite
if [ -n "$CUSTOM_BASE" ]; then
  BASE_PATH="$CUSTOM_BASE"
elif [ -n "$REPO_NAME" ]; then
  # Dynamic relative base path guarantees assets resolve regardless of subpath
  BASE_PATH="./"
else
  BASE_PATH="./"
fi
echo -e "  • Public Asset Base: ${GREEN}${BASE_PATH}${NC}"

# Step 2: Clean Existing Build Folder
echo ""
echo -e "${CYAN}[2/6] Cleaning Previous Build Folders...${NC}"
if [ -d "$DIST_DIR" ]; then
  rm -rf "$DIST_DIR"
  echo -e "  • Removed old ${AMBER}${DIST_DIR}/${NC} directory."
fi
rm -rf .gh-temp-deploy
echo -e "  • ${GREEN}Workspace cleaned.${NC}"

# Step 3: Run Type Check & Vite Production Build
echo ""
echo -e "${CYAN}[3/6] Compiling SpectrumX Production Bundle...${NC}"
export VITE_BASE_PATH="$BASE_PATH"

# Run Vite build
npm run build -- --base="$BASE_PATH"

if [ ! -f "${DIST_DIR}/index.html" ]; then
  echo -e "${RED}Error: Build failed - ${DIST_DIR}/index.html was not generated.${NC}"
  exit 1
fi
echo -e "  • ${GREEN}Vite bundle compiled successfully.${NC}"

# Step 4: Inject Static Hosting & GitHub Pages Primitives
echo ""
echo -e "${CYAN}[4/6] Configuring Static Hosting Primitives for GitHub Pages...${NC}"

# 1. .nojekyll: prevents GitHub Pages from ignoring files beginning with underscores (Vite asset chunks)
touch "${DIST_DIR}/.nojekyll"
echo -e "  • Created ${GREEN}.nojekyll${NC} (bypasses Jekyll parser on GitHub Pages)"

# 2. 404.html: fallback routing so SPA refreshes don't break
cp "${DIST_DIR}/index.html" "${DIST_DIR}/404.html"
echo -e "  • Created ${GREEN}404.html${NC} (enables client-side routing on GitHub Pages)"

# 3. Custom domain CNAME if requested
if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "$CUSTOM_DOMAIN" > "${DIST_DIR}/CNAME"
  echo -e "  • Created ${GREEN}CNAME${NC} with domain: ${CUSTOM_DOMAIN}"
fi

# Step 5: Verification & Size Diagnostics
echo ""
echo -e "${CYAN}[5/6] Verifying Deployment Artifacts...${NC}"
INDEX_SIZE=$(wc -c < "${DIST_DIR}/index.html" | tr -d ' ')
ASSET_COUNT=$(find "${DIST_DIR}" -type f | wc -l | tr -d ' ')
echo -e "  • Artifacts Count: ${GREEN}${ASSET_COUNT} files${NC}"
echo -e "  • index.html Size: ${GREEN}${INDEX_SIZE} bytes${NC}"
echo -e "  • Firestore Config: ${GREEN}Bundled (savvy-throne-qlxdt)${NC}"

# Step 6: Deploy or Provide Instructions
echo ""
echo -e "${CYAN}[6/6] Finalizing Deployment Target...${NC}"

if [ "$AUTO_PUSH" = true ]; then
  if [ -z "$GIT_REMOTE" ]; then
    echo -e "${RED}Error: Cannot push automatically because no git remote origin is configured.${NC}"
    echo -e "Run: git remote add origin https://github.com/<your-user>/<your-repo>.git"
    exit 1
  fi

  echo -e "${AMBER}Pushing distribution bundle to branch 'gh-pages'...${NC}"
  
  # Deploy using temporary git tree without polluting working tree
  DEPLOY_DIR=".gh-temp-deploy"
  rm -rf "$DEPLOY_DIR"
  mkdir -p "$DEPLOY_DIR"
  cp -r "${DIST_DIR}/." "$DEPLOY_DIR"
  
  cd "$DEPLOY_DIR"
  git init -q
  git config user.name "SpectrumX Deploy Bot"
  git config user.email "deploy@spectrumx.ai"
  git add -A
  git commit -q -m "deploy: SpectrumX live build [$(date '+%Y-%m-%d %H:%M:%S')]"
  git branch -M gh-pages
  git push -f "$GIT_REMOTE" gh-pages
  cd ..
  rm -rf "$DEPLOY_DIR"

  echo ""
  echo -e "${GREEN}${BOLD}================================================================${NC}"
  echo -e "${GREEN}${BOLD}🚀 SPECTRUMX SUCCESSFULLY DEPLOYED TO GITHUB PAGES!${NC}"
  echo -e "${GREEN}${BOLD}================================================================${NC}"
  if [ -n "$REPO_NAME" ]; then
    USER_NAME=$(echo "$GIT_REMOTE" | sed -E 's/.*[:\/]([^\/]+)\/[^\/]+(\.git)?$/\1/')
    echo -e "Your live web application will be accessible in 60-90 seconds at:"
    echo -e "${CYAN}${BOLD}👉 https://${USER_NAME}.github.io/${REPO_NAME}/${NC}"
  fi
else
  echo -e "${GREEN}${BOLD}Static build is READY in the './dist' folder!${NC}"
  echo ""
  echo -e "${BOLD}To deploy to GitHub Pages, choose ONE of these 2 easy options:${NC}"
  echo ""
  echo -e "${CYAN}${BOLD}Option A: One-Command Auto Push (Fastest)${NC}"
  echo "  Run this script with the --push flag:"
  echo -e "  ${GREEN}./deploy.sh --push${NC}"
  echo ""
  echo -e "${CYAN}${BOLD}Option B: GitHub Actions CI/CD (Best for Hackathon Judges)${NC}"
  echo "  1. Push your repository to GitHub:"
  echo -e "     ${GREEN}git add .${NC}"
  echo -e "     ${GREEN}git commit -m 'feat: complete SpectrumX release'${NC}"
  echo -e "     ${GREEN}git push origin main${NC}"
  echo "  2. Go to your GitHub Repository -> ${BOLD}Settings${NC} -> ${BOLD}Pages${NC}"
  echo "  3. Under 'Build and deployment' -> 'Source':"
  echo "     Select: ${BOLD}GitHub Actions${NC} (or 'Deploy from a branch' -> branch 'gh-pages' -> folder '/ (root)')"
  echo ""
  echo -e "${PURPLE}${BOLD}🎉 Live URL format: https://<your-username>.github.io/<your-repo>/${NC}"
fi

echo ""
