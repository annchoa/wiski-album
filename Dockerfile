FROM oven/bun:1

# vue-tsc does not resolve .vue modules correctly under the Bun runtime
# (https://github.com/vuejs/language-tools/issues/6090), so a real Node.js
# is installed to run it; everything else in this project still runs on Bun.
RUN apt-get update && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

# The image's built-in "bun" user (uid/gid 1000) is used instead of root so
# that files written into the bind-mounted project (bun.lock, build output)
# keep the host user's ownership instead of root's.
WORKDIR /app
RUN chown bun:bun /app
USER bun

COPY --chown=bun:bun package.json bun.lock ./
RUN bun install

COPY --chown=bun:bun . .

EXPOSE 5173

CMD ["bun", "run", "dev", "--host"]
