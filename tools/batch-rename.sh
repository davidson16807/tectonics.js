find . -name "*.js" -exec sed -i ''  \
-e 's/1st old/2nd new/g'  \
-e 's/2nd old/2nd new/g'  \
{} \;
