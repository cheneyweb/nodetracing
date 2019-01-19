# FROM node
FROM node:slim
# 创建应用目录
RUN mkdir -p /usr/node/nodetracing
# 设置工作目录
WORKDIR /usr/node/nodetracing
# 复制所有文件到工作目录
COPY . /usr/node/nodetracing
# 编译运行node项目
RUN npm install
# 运行命令
CMD ["npm", "start"]