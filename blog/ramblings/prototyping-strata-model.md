def simplify_top(strata):
	top = strata.top
	under_top = below(top)
	if strata[top].type == strata[under_top].type: 
		strata[under_top].mass += strata[top].mass
		strata.top = under_top


def simplify_bottom(strata):
	bottom = strata.bottom
	above_bottom = above(bottom)
	if strata.size > max_size: 
		strata[above_bottom].mass += strata[bottom].mass
		strata.bottom = above_bottom

def push(strata, layer):
	above_top = above(strata.top)
	strata[above_top].mass = layer.mass
	strata[above_top].type = layer.type
	strata.top = above_top