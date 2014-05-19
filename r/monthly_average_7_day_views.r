# 
setwd("~/code/public-code/elife-utility-scripts/python/google-analytics")
week_data = read.csv("sorted_week.dat", sep="")
# article id
week_data[[1]]
# day published
week_data[[2]]
# visits
week_data[[3]]
# could not install xts from the command line, used the RStudio interface to do it!
library(xts)
# this creates sets of data out of each colum, indexd by date
samplextx <- as.xts(ordered_week_data,as.Date(ordered_week_data[[2]]))
# this creates an index of one colume indexed on date
samplextx <- as.xts(ordered_week_data[[3]],as.Date(ordered_week_data[[2]]))
# plot monthly average
plot(apply.monthly(samplextx, mean))
# plot daily average
plot(apply.daily(samplextx, mean))
