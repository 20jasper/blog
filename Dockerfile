FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

RUN curl -fsSL https://deb.nodesource.com/setup_26.x | bash - \
	&& apt-get install -y nodejs

ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME/bin:$PATH
RUN SHELL=/bin/bash npx --yes get-pnpm@0.0.5 12

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build
