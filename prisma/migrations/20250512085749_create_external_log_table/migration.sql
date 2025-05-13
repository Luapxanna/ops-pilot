-- CreateTable
CREATE TABLE "ExternalLog" (
    "id" SERIAL NOT NULL,
    "taskId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalLog_taskId_idx" ON "ExternalLog"("taskId");

-- CreateIndex
CREATE INDEX "ExternalLog_userId_idx" ON "ExternalLog"("userId");

-- AddForeignKey
ALTER TABLE "ExternalLog" ADD CONSTRAINT "ExternalLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalLog" ADD CONSTRAINT "ExternalLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
