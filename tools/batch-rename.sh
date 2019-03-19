find . -name "*.js" -exec sed -i  \
-e 's//foo/bar'  \
{} \;
