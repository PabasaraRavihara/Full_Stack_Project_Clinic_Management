# 1. Node.js තියෙන Image එකක්
FROM node:22-alpine


# 2. වැඩ කරන තැන
WORKDIR /app

# 3. Package ෆයිල්ස් කොපි කරනවා
COPY package.json .

# 4. Dependencies ඉන්ස්ටෝල් කරනවා
RUN npm install

# 5. Project එකේ ඉතුරු ෆයිල්ස් කොපි කරනවා
COPY . .

# 6. Port එක එළියට දෙනවා
EXPOSE 5173

# 7. React Run කරනවා
CMD ["npm", "run", "dev", "--", "--host"]