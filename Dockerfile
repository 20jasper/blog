FROM mcr.microsoft.com/playwright:v1.62.1-noble

WORKDIR /app

RUN curl -fsSL https://deb.nodesource.com/setup_26.x | bash - \
	&& apt-get install -y nodejs \
	&& npm install -g --force corepack@latest \
	&& corepack enable && corepack prepare pnpm@11.23.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
