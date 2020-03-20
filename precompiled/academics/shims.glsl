
bool isnan( float val )
{
  return !( val < 0.0 || 0.0 < val || val == 0.0 );
  // important: some nVidias failed to cope with version below.
  // Probably wrong optimization.
  /*return ( val <= 0.0 || 0.0 <= val ) ? false : true;*/
}