var documenterSearchIndex = {"docs":
[{"location":"staticelasticity/#Static-Linear-Elasticity-1","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"","category":"section"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"The governing equation for static linear elasticity is","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"beginaligned\nmathrmdiv sigma(u) = f(x)  xin Omega \nsigma(u) = Cvarepsilon(u) \nu(x) = u_0(x)  xin Gamma_u\nsigma(x) n(x) = t(x)  xin Gamma_n\nendaligned","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"Here varepsilon(u) = frac12(nabla u + (nabla u)^T) is the Cauchy tensor, Gamma_u cup Gamma_n = Omega, Gamma_u cap Gamma_n = emptyset. The weak formulation is: finding u such that ","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"int_Omega delta varepsilon(u)  C varepsilon(u)mathrmd x = int_Gamma_n tcdotdelta u mathrmds - int_Omega fcdot delta u mathrmdx","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"We consider the manufactured solution ","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"u(x) = beginbmatrix\nx_1^2+x_2^2\nx_1^2-x_2^2\nendbmatrix","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"and ","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"beginbmatrix\nsigma_xx\nsigma_yy\nsigma_xy\nendbmatrix = beginbmatrix\n1  0  0\n0  1  0\n0  0  12\nendbmatrixbeginbmatrix\nvarepsilon_xx\nvarepsilon_yy\n2varepsilon_xy\nendbmatrix","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"then we have ","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"f(x) = beginbmatrix\n3\n-1\nendbmatrix","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"We let Gamma_n be the top boundary. ","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"bdedge = []\nfor i = 1:m \n    push!(bdedge, [i i+1])\nend\nbdedge = vcat(bdedge...)\n\nbdnode = Int64[]\nfor j = 1:n+1\n    push!(bdnode, (j-1)*(m+1)+1)\n    push!(bdnode, (j-1)*(m+1)+m+1)\nend\nfor i = 2:m\n    push!(bdnode, n*(m+1)+i)\nend\n\nF1 = eval_f_on_gauss_pts((x,y)->3.0, m, n, h)\nF2 = eval_f_on_gauss_pts((x,y)->-1.0, m, n, h)\nF = compute_fem_source_term(F1, F2, m, n, h)\n\nt1 = eval_f_on_boundary_edge((x,y)->-x-y, bdedge, m, n, h)\nt2 = eval_f_on_boundary_edge((x,y)->2y, bdedge, m, n, h)\nT = compute_fem_traction_term([t1 t2], bdedge, m, n, h)\n\nD = diagm(0=>[1,1,0.5])\nK = compute_fem_stiffness_matrix(D, m, n, h)\nrhs = T - F \nbdval = [eval_f_on_boundary_node((x,y)->x^2+y^2, bdnode, m, n, h);\n        eval_f_on_boundary_node((x,y)->x^2-y^2, bdnode, m, n, h)]\nrhs[[bdnode;bdnode .+ (m+1)*(n+1)]] = bdval\nK, Kbd = fem_impose_Dirichlet_boundary_condition(K, bdnode, m, n, h)\nu = K\\(rhs-Kbd*bdval)\nX, Y, U, V = plot_u(u, m, n, h)\n\nfigure(figsize=[10,4])\nsubplot(121)\npcolormesh(X, Y, (@. X^2+Y^2-U), alpha=0.6); xlabel(\"x\"); ylabel(\"y\"); title(\"Error for u\")\ncolorbar()\nsubplot(122)\npcolormesh(X, Y, (@. X^2-Y^2-V), alpha=0.6); xlabel(\"x\"); ylabel(\"y\"); title(\"Error for v\")\ncolorbar()","category":"page"},{"location":"staticelasticity/#","page":"Static Linear Elasticity","title":"Static Linear Elasticity","text":"(Image: )","category":"page"},{"location":"api/#API-1","page":"API","title":"API","text":"","category":"section"},{"location":"api/#Data-Structures-1","page":"API","title":"Data Structures","text":"","category":"section"},{"location":"api/#","page":"API","title":"API","text":"PoreData","category":"page"},{"location":"api/#PoreFlow.PoreData","page":"API","title":"PoreFlow.PoreData","text":"PoreData is a collection of physical parameters for coupled geomechanics and flow simulation\n\nM: Biot modulus\nb: Biot coefficient\nρb: Bulk density\nρf: Fluid density\nkp: Permeability\nE: Young modulus\nν: Poisson ratio\nμ: Fluid viscosity\nPi: Initial pressure\nBf: formation volume, B_f=fracrho_f0rho_f\ng: Gravity acceleration\n\n\n\n\n\n","category":"type"},{"location":"api/#Matrix-Assembling-Functions-1","page":"API","title":"Matrix Assembling Functions","text":"","category":"section"},{"location":"api/#","page":"API","title":"API","text":"compute_fem_stiffness_matrix\ncompute_interaction_matrix\ncompute_fluid_tpfa_matrix\ncompute_fem_mass_matrix\ncompute_fem_mass_matrix1\ncompute_fem_stiffness_matrix1","category":"page"},{"location":"api/#PoreFlow.compute_fem_stiffness_matrix","page":"API","title":"PoreFlow.compute_fem_stiffness_matrix","text":"compute_fem_stiffness_matrix(K::Array{Float64,2}, m::Int64, n::Int64, h::Float64)\n\nComputes the term \n\nint_Adelta varepsilon sigmamathrmdx = int_A u_AB^TDBdelta u_Amathrmdx\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_interaction_matrix","page":"API","title":"PoreFlow.compute_interaction_matrix","text":"compute_interaction_matrix(m::Int64, n::Int64, h::Float64)\n\nComputes the interaction term \n\nint_A p delta varepsilon_vmathrmdx = int_A p 110B^Tdelta u_Amathrmdx\n\nThe output is a mn times 2(m+1)(n+1) matrix. \n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fluid_tpfa_matrix","page":"API","title":"PoreFlow.compute_fluid_tpfa_matrix","text":"compute_fluid_tpfa_matrix(m::Int64, n::Int64, h::Float64)\n\nComputes the term with two-point flux approximation \n\nint_A_i Delta p mathrmdx = sum_j=1^n_mathrmfaces (p_j-p_i)\n\n(Image: )\n\nwarning: Warning\n\n\nNo flow boundary condition is assumed. \n\n\n\n\n\ncompute_fluid_tpfa_matrix(K::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nComputes the term with two-point flux approximation with distinct permeability at each cell\n\nint_A_i K_i Delta p mathrmdx = K_isum_j=1^n_mathrmfaces (p_j-p_i)\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_mass_matrix","page":"API","title":"PoreFlow.compute_fem_mass_matrix","text":"compute_fem_mass_matrix(m::Int64, n::Int64, h::Float64)\n\nComputes the finite element mass matrix \n\nint_Omega u delta u mathrmdx\n\nThe matrix size is 2(m+1)(n+1) times 2(m+1)(n+1).\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_mass_matrix1","page":"API","title":"PoreFlow.compute_fem_mass_matrix1","text":"compute_fem_mass_matrix1(ρ::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nComputes the mass matrix for a scalar value u\n\nint_A rho u delta u mathrmd x\n\nThe output is a (m+1)*(n+1) sparse matrix. \n\n\n\n\n\ncompute_fem_mass_matrix1(m::Int64, n::Int64, h::Float64)\n\nComputes the mass matrix for a scalar value u\n\n\\int_A u \\delta u \\mathrm{d} x\n\nThe output is a (m+1)*(n+1) sparse matrix. \n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_stiffness_matrix1","page":"API","title":"PoreFlow.compute_fem_stiffness_matrix1","text":"compute_fem_stiffness_matrix1(K::Array{Float64,2}, m::Int64, n::Int64, h::Float64)\n\nComputes the term \n\nint_A (K nabla u) cdot nabla delta u mathrmdx = int_A u_A B^T K B delta u_Amathrmdx\n\nReturns a (m+1)times (n+1) matrix\n\n\n\n\n\n","category":"function"},{"location":"api/#Vector-Assembling-Functions-1","page":"API","title":"Vector Assembling Functions","text":"","category":"section"},{"location":"api/#","page":"API","title":"API","text":"compute_fem_source_term\ncompute_fvm_source_term\ncompute_fvm_mechanics_term\ncompute_fem_normal_traction_term\ncompute_principal_stress_term\ncompute_fem_source_term1\ncompute_fem_flux_term1","category":"page"},{"location":"api/#PoreFlow.compute_fem_source_term","page":"API","title":"PoreFlow.compute_fem_source_term","text":"compute_fem_source_term(f1::Array{Float64}, f2::Array{Float64},\nm::Int64, n::Int64, h::Float64)\n\nComputes the term \n\nint_Omega fcdotdelta u dx\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fvm_source_term","page":"API","title":"PoreFlow.compute_fvm_source_term","text":"compute_fvm_source_term(f::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nComputes the source term \n\nint_A_i fmathrmdx\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fvm_mechanics_term","page":"API","title":"PoreFlow.compute_fvm_mechanics_term","text":"compute_fvm_mechanics_term(u::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nComputes the mechanic interaction term \n\nint_A_i varepsilon_vmathrmdx\n\nHere \n\nvarepsilon_v = mathrmtr varepsilon = varepsilon_xx + varepsilon_yy\n\nNumerically, we have \n\nvarepsilon_v = 1  1  0 B^T delta u_A\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_normal_traction_term","page":"API","title":"PoreFlow.compute_fem_normal_traction_term","text":"compute_fem_normal_traction_term(t::Array{Float64,1}, bdedge::Array{Int64},\nm::Int64, n::Int64, h::Float64)\ncompute_fem_normal_traction_term(t::Float64, bdedge::Array{Int64},\nm::Int64, n::Int64, h::Float64)\n\nComputes the normal traction term \n\nint_Gamma t(mathbfn)cdotdelta u mathrmd\n\nHere t(mathbfn)parallelmathbfn points outward to the domain and the magnitude is given by t.  bdedge is a Ntimes2 matrix and each row denotes the indices of two endpoints of the boundary edge. \n\nSee compute_fem_traction_term for graphical illustration.\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_principal_stress_term","page":"API","title":"PoreFlow.compute_principal_stress_term","text":"computeprincipalstress_term(K::Array{Float64}, u::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nCompute the principal stress on the Gauss quadrature nodes. \n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_source_term1","page":"API","title":"PoreFlow.compute_fem_source_term1","text":"compute_fem_source_term1(f::Array{Float64},\nm::Int64, n::Int64, h::Float64)\n\nComputes the term \n\nint_Omega f delta u dx\n\nReturns a (m+1)times (n+1) vector. \n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_fem_flux_term1","page":"API","title":"PoreFlow.compute_fem_flux_term1","text":"compute_fem_flux_term1(t::Array{Float64},\nbdedge::Array{Int64,2}, m::Int64, n::Int64, h::Float64)\n\nComputes the traction term \n\nint_Gamma q delta u mathrmd\n\n\n\n\n\n","category":"function"},{"location":"api/#Evaluation-Functions-1","page":"API","title":"Evaluation Functions","text":"","category":"section"},{"location":"api/#","page":"API","title":"API","text":"eval_f_on_gauss_pts\neval_f_on_boundary_node\neval_f_on_boundary_edge\neval_strain_on_gauss_pts","category":"page"},{"location":"api/#PoreFlow.eval_f_on_gauss_pts","page":"API","title":"PoreFlow.eval_f_on_gauss_pts","text":"eval_f_on_gauss_pts(f::Function, m::Int64, n::Int64, h::Float64)\n\nEvaluates f at Gaussian points and return the result as 4mn vector out (4 Gauss points per element)\n\n(Image: )\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.eval_f_on_boundary_node","page":"API","title":"PoreFlow.eval_f_on_boundary_node","text":"eval_f_on_boundary_node(f::Function, bdnode::Array{Int64}, m::Int64, n::Int64, h::Float64)\n\nReturns a vector of the same length as bdnode whose entries corresponding to bdnode nodes are filled with values computed from f.\n\nf has the following signature \n\nf(x::Float64, y::Float64)::Float64\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.eval_f_on_boundary_edge","page":"API","title":"PoreFlow.eval_f_on_boundary_edge","text":"eval_f_on_boundary_edge(f::Function, bdedge::Array{Int64,2}, m::Int64, n::Int64, h::Float64)\n\nReturns a vector of the same length as bdedge whose entries corresponding to bdedge nodes are filled with values computed from f.\n\nf has the following signature \n\nf(x::Float64, y::Float64)::Float64\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.eval_strain_on_gauss_pts","page":"API","title":"PoreFlow.eval_strain_on_gauss_pts","text":"eval_strain_on_gauss_pts(u::Array{Float64}, m::Int64, n::Int64, h::Float64)\n\nComputes the strain on Gauss points.  Returns a 4mn times 3 matrix\n\n\n\n\n\n","category":"function"},{"location":"api/#Misc-1","page":"API","title":"Misc","text":"","category":"section"},{"location":"api/#","page":"API","title":"API","text":"fem_impose_Dirichlet_boundary_condition\nfem_impose_Dirichlet_boundary_condition1\ntrim_coupled\ncompute_elasticity_tangent\ncoupled_impose_pressure","category":"page"},{"location":"api/#PoreFlow.fem_impose_Dirichlet_boundary_condition","page":"API","title":"PoreFlow.fem_impose_Dirichlet_boundary_condition","text":"fem_impose_Dirichlet_boundary_condition(A::SparseMatrixCSC{Float64,Int64}, \nbd::Array{Int64}, m::Int64, n::Int64, h::Float64)\n\nImposes the Dirichlet boundary conditions on the matrix A.\n\nReturns 2 matrix, \n\nbeginbmatrix\nA_BB  A_BI  \nA_IB  A_II \nendbmatrix Rightarrow beginbmatrix\nI  0  \n0  A_II \nendbmatrix quad beginbmatrix\n0  \nA_IB \nendbmatrix\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.fem_impose_Dirichlet_boundary_condition1","page":"API","title":"PoreFlow.fem_impose_Dirichlet_boundary_condition1","text":"fem_impose_Dirichlet_boundary_condition1(A::SparseMatrixCSC{Float64,Int64}, \n    bd::Array{Int64}, m::Int64, n::Int64, h::Float64)\n\nImposes the Dirichlet boundary conditions on the matrix A Returns 2 matrix, \n\nbeginbmatrix\nA_BB  A_BI  \nA_IB  A_II \nendbmatrix Rightarrow beginbmatrix\nI  0  \n0  A_II \nendbmatrix quad beginbmatrix\n0  \nA_IB \nendbmatrix\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.trim_coupled","page":"API","title":"PoreFlow.trim_coupled","text":"trim_coupled(pd::PoreData, Q::SparseMatrixCSC{Float64,Int64}, L::SparseMatrixCSC{Float64,Int64},  M::SparseMatrixCSC{Float64,Int64},  bd::Array{Int64}, Δt::Float64, m::Int64, n::Int64, h::Float64)\n\nAssembles matrices from mechanics and flow and assemble the coupled matrix \n\nbeginbmatrix\nhat M  -hat L^T\nhat L  hat Q\nendbmatrix\n\nQ is obtained from compute_fluid_tpfa_matrix, M is obtained from compute_fem_stiffness_matrix, and L is obtained from compute_interaction_matrix.\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.compute_elasticity_tangent","page":"API","title":"PoreFlow.compute_elasticity_tangent","text":"compute_elasticity_tangent(E::Float64, ν::Float64)\n\nComputes the elasticity matrix for 2D plane strain\n\n\n\n\n\n","category":"function"},{"location":"api/#PoreFlow.coupled_impose_pressure","page":"API","title":"PoreFlow.coupled_impose_pressure","text":"coupledimposepressure(A::SparseMatrixCSC{Float64,Int64}, pnode::Array{Int64},  m::Int64, n::Int64, h::Float64)\n\nReturns a trimmed matrix.\n\n\n\n\n\n","category":"function"},{"location":"coupled/#Coupled-Geomechanics-and-Multiphase-Flow-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"","category":"section"},{"location":"coupled/#Mathematical-Formulation-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Mathematical Formulation","text":"","category":"section"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The governing equation for mechanical deformation of the solid-fluid system is ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"boxedmathrmdiv sigma + rho_b g = 0","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where mathrmdiv is the divergence operator, sigma is the Cauchy total-stress ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"sigma = beginbmatrix\nsigma_xx  sigma_xy\nsigma_xy  sigma_yy\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"and ginmathbbR^2 is the gravity vector, rho_b=phi rho_f + (1-phi)rho_s  is the bulk density, rho_f is total fluid density, rho_s is the density of the solid phase and phi is the true porosity. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The stress-strain relation for linear poroelasticity takes the form ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"sigma = sigma - bpmathbfIquad sigma = beginbmatrix\nsigma_xx  sigma_xy\nsigma_xy  sigma_yy\nendbmatrix\nquadbeginbmatrix\ndeltasigma_xxdeltasigma_yydeltasigma_xy\nendbmatrix = Dbeginbmatrix\ndeltavarepsilon_xxdeltavarepsilon_yy2deltavarepsilon_xy\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where mathbfI is the identity matrix, p is the pressure, b is the Biot coefficient, D is the elasticity matrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"D = fracE(1-nu)(1+nu)(1-2nu)beginbmatrix\n1  fracnu1-nu fracnu1-nu\nfracnu1-nu  1  fracnu1-nu\nfracnu1-nu  fracnu1-nu  1\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Here E is the Young modulus,  nu is the Poisson ratio and  varepsilon is the strain","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"varepsilon = beginbmatrix\nvarepsilon_xx  varepsilon_xy\nvarepsilon_xy  varepsilon_yy\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"info: Info\nThe relation between sigma and varepsilon may be nonlinear; that's why we only write delta sigma in terms of delta varepsilon. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The fluid mass convervation in terms of pressure and volumetric strain is given by ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"boxedfrac1Mfracpartial ppartial t + bfracpartial varepsilon_vpartial t + mathrmdivmathrmv = f","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where varepsilon_v = mathrmtr varepsilon, f is a volumetric source term and ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"mathbfv = -frac1B_ffrackmu(nabla p - rho_f g)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where k is the absolute permeability tensor, mu is the fluid viscosity and B_f is the formation volume factor of the fluid. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The mechanical equation and fluid equation are coupled through p and varepsilon. In the drained split scheme, in each step p is kept fixed while solving the mechanics equation and then the fluid equation is solved keeping varepsilon fixed. The drained scheme can be viewed as a Jacobian iteration of the fully coupled system. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"note: Note\nThe linear poroelasticity equations with g=0 can be expressed as [linear]beginaligned\nmathrmdivsigma(u) - b nabla p = 0\nfrac1M fracpartial ppartial t + bfracpartial varepsilon_v(u)partial t - nablacdotleft(frackB_fmunabla pright) = f(xt)\nendaligned​with boundary conditionsbeginaligned\nsigma n = 0quad xin Gamma_N^u qquad u=0 quad xin Gamma_D^u\n-frackB_fmufracpartial ppartial n = 0quad xin Gamma_N^p qquad p=g quad xin Gamma_N^p\nendalignedand the initial conditionp(x0) = p_0 u(x0) =0 xin Omega","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"[linear]: Kolesov, Alexandr E., Petr N. Vabishchevich, and Maria V. Vasilyeva. \"Splitting schemes for poroelasticity and thermoelasticity problems.\" Computers & Mathematics with Applications 67.12 (2014): 2185-2198.","category":"page"},{"location":"coupled/#Numerical-Discretization-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Numerical Discretization","text":"","category":"section"},{"location":"coupled/#Mechanics-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Mechanics","text":"","category":"section"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"We discretize the domain 0(n-1)htimes 0 (m-1)h uniformly with step size h.","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: )","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The finite element method is usually used to solve the mechanics equation, whose discretization reads","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_Omega delta varepsilon sigmamathrmdx - int_Omega b p delta varepsilon_vmathrmdx = int_Gamma tcdotdelta umathrmds + int_Omega rho_b gcdotdelta u dx","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where t = sigma n = sigma n - bpn, Gamma is the part of partial Omega with external traction,  and n is the unit normal vector pointing outwards. One each element A, define u_A as the nodal values of the basis functions whose supports overlap A, then the strain at (xy) can be expressed as (see the figure for illustration)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"varepsilon_A = Bu_A quad varepsilon_A =beginbmatrix\nvarepsilon_xx\nvarepsilon_yy\n2varepsilon_xy\nendbmatrixquad\nu_A = beginbmatrix\nu_1\nu_2\nu_3\nu_4\nv_1\nv_2\nv_3\nv_4\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"B = beginbmatrix\nfracpartial N_1partial x  fracpartial N_2partial x  fracpartial N_3partial x  fracpartial N_4partial x  0  0  0  0\n0  0  0  0  fracpartial N_1partial y  fracpartial N_2partial y  fracpartial N_3partial y  fracpartial N_4partial y\nfracpartial N_1partial y  fracpartial N_2partial y  fracpartial N_3partial y  fracpartial N_4partial y  fracpartial N_1partial x  fracpartial N_2partial x  fracpartial N_3partial x  fracpartial N_4partial x\nendbmatrix = beginbmatrix\n-frac1-etahfrac1-etah -fracetah  fracetah  0  0  0  0\n0  0  0  0  -frac1-xih  -fracxih  frac1-xih  fracxih\n-frac1-xih  -fracxih  frac1-xih  fracxih  -frac1-etahfrac1-etah -fracetah  fracetah\nendbmatrix","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"and","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"xi = fracx-x_0hquad eta = fracy-y_0h","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: )","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The terms in the weak form can be expressed as ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_Adelta varepsilon sigmamathrmdx = int_A u_AB^TDBdelta u_Amathrmdx","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_A b p delta varepsilon_vmathrmdx = int_A bp 110B^Tdelta u_Amathrmdx","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Typically, the integration is computed using Gauss quadrature; for example, we have","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_A u_AB^TDBdelta u_Amathrmdx = u_A leftsum_i=1^n_g B(xi_i eta_i)^T DB(xi_i eta_i)h^2w_irightdelta u_A","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where (x_i eta_i) are Gauss quadrature points and w_i is the corresponding weight. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"note: Note\nWe have the following convention for bdnode and bdedge, which denote the Dirichlet boundary conditions and the Neumann boundary conditions:bdnodein mathbfR^d and each entry in bdnode represents the node index. The corresponding row and column indices can be retrieved with femidx.\nbdedgein mathbfR^dtimes 2 and each row in bdedge represents indices of two end points of the edge. The corresponding cell row and column can be retrieved with fvmidx.","category":"page"},{"location":"coupled/#Fluid-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Fluid","text":"","category":"section"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The fluid equation is discretized using finite volume method. ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_A_i frac1Mfracp_i^n+1 - p_i^nDelta t mathrmdx + int_A_i b fracvarepsilon_v^n+1-varepsilon_v^nDelta t mathrmd x + int_A_i mathrmdivmathbfvmathrmdx = int_A_i fmathrmdx","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"For the divergence term, we use the two-point flux approximation and we have (assuming k is a constant scalar)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"int_A_i mathrmdivmathbfv mathrmdx = -frackB_fmusum_j=1^n_mathrmfaces (q_j-q_i) = -frackB_fmusum_j=1^n_mathrmfaces (p_j^n+1 - p_i^n+1) + frackrho_fgB_fmusum_j=1^n_mathrmfaces (y_j-y_i)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"where q = p^n+1 - rho_fgy","category":"page"},{"location":"coupled/#Initial-and-Boundary-Conditions-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Initial and Boundary Conditions","text":"","category":"section"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"For the mechanial problem we consider","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Prescribed displacement: u = bar u; or\nPrescribed traction: sigmacdot n=bar t (also called overburden).","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"For the flow problem we consider","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Prescribed pressure: p=bar p; or\nPrescribed volumetric flux: mathbfvcdot n=bar v (called no flow if bar v=0).","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"The initial displacement and strains are zero. The initial pressure is prescribed. ","category":"page"},{"location":"coupled/#Numerical-Example-1","page":"Coupled Geomechanics and Multiphase Flow","title":"Numerical Example","text":"","category":"section"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Here is a list of reasonable parameters","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: )","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"Property Value\nPermeability k 10^-18m^2\nBiot coefficient b 1.0\nBulk density rho_b 2400 kg/m^3\nFluid viscosity mu 0.001 Pacdots^-1\nDomain 05times 010\nFluid density rho_f 1000 kg/m^3\nInitial pressure P_i 10^7 Pa\nTraction $ \\bar t\nShear modulus G 15 GPa\nLamé constant lambda 10 GPa\nBiot modulus M 50 GPa\nTime horizon 3 days\nTime step 0.1 days","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"​                                    ","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: p)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: p)","category":"page"},{"location":"coupled/#","page":"Coupled Geomechanics and Multiphase Flow","title":"Coupled Geomechanics and Multiphase Flow","text":"(Image: p)","category":"page"},{"location":"plasticity/#Plasticity-1","page":"Plasticity","title":"Plasticity","text":"","category":"section"},{"location":"plasticity/#","page":"Plasticity","title":"Plasticity","text":"(Image: )","category":"page"},{"location":"elastodynamics/#Elastodynamics-1","page":"Elastodynamics","title":"Elastodynamics","text":"","category":"section"},{"location":"elastodynamics/#","page":"Elastodynamics","title":"Elastodynamics","text":"The governing equation for elastodynamics is  $ \\begin{aligned} \\frac{\\partial^2 u}{\\partial t^2} &= \\mathrm{div}\\sigma + f& \\Omega\\times [0,T]\\\n\\sigma n &= t & \\GammaN\\times [0,T]\\\nu &= u0 & \\Gamma_D\\times[0,T] \\end{aligned} $ The constitutive law is given by  $ \\sigma = C\\varepsilon $ We fix the left side of the plate. We use the alpha method [alpha].","category":"page"},{"location":"elastodynamics/#","page":"Elastodynamics","title":"Elastodynamics","text":"[alpha]: Hughes, Thomas JR. The finite element method: linear static and dynamic finite element analysis. Courier Corporation, 2012. ","category":"page"},{"location":"elastodynamics/#","page":"Elastodynamics","title":"Elastodynamics","text":"Gravity External Force\n(Image: ) (Image: )","category":"page"},{"location":"elastodynamics/#","page":"Elastodynamics","title":"Elastodynamics","text":"β = 1/4; γ = 1/2\na = b = 0.1\nm = 40\nn = 20\nh = 0.01\nNT = 200\nΔt = 1/NT \nbdedge = []\nfor j = 1:n \n  push!(bdedge, [(j-1)*(m+1)+m+1 j*(m+1)+m+1])\nend\nbdedge = vcat(bdedge...)\n\nbdnode = Int64[]\nfor j = 1:n+1\n  push!(bdnode, (j-1)*(m+1)+1)\nend\n\nM = compute_fem_mass_matrix1(m, n, h)\nS = spzeros((m+1)*(n+1), (m+1)*(n+1))\nM = [M S;S M]\n\nK = compute_fem_stiffness_matrix(D, m, n, h)\nC = a*M + b*K # damping matrix \n\nL = M + γ*Δt*C + β*Δt^2*K\nL, Lbd = fem_impose_Dirichlet_boundary_condition(L, bdnode, m, n, h)\n\na = zeros(2(m+1)*(n+1))\nv = zeros(2(m+1)*(n+1))\nd = zeros(2(m+1)*(n+1))\nU = zeros(2(m+1)*(n+1),NT+1)\nfor i = 1:NT \n  T = eval_f_on_boundary_edge((x,y)->0.01, bdedge, m, n, h)\n  # T = eval_f_on_boundary_edge((x,y)->0.0, bdedge, m, n, h)\n  T = [zeros(length(T)) -T]\n  T = compute_fem_traction_term(T, bdedge, m, n, h)\n  f1 = eval_f_on_gauss_pts((x,y)->0., m, n, h)\n  f2 = eval_f_on_gauss_pts((x,y)->0., m, n, h)\n  # f2 = eval_f_on_gauss_pts((x,y)->0.1, m, n, h)\n  F = compute_fem_source_term(f1, f2, m, n, h)\n\n  rhs = F+T\n\n  td = d + Δt*v + Δt^2/2*(1-2β)*a \n  tv = v + (1-γ)*Δt*a \n  rhs = rhs - C*tv - K*td\n  rhs[[bdnode; bdnode.+(m+1)*(n+1)]] .= 0.0\n\n  a = L\\rhs \n  d = td + β*Δt^2*a \n  v = tv + γ*Δt*a \n  U[:,i+1] = d\nend\n\nx = []\ny = []\nfor j= 1:n+1\n  for i = 1:m+1\n    push!(x, (i-1)*h)\n    push!(y, (j-1)*h)\n  end\nend\nfor i = 1:10:NT+1\n  close(\"all\")\n  scatter(x+U[1:(m+1)*(n+1), i], y+U[(m+1)*(n+1)+1:end, i])\n  xlabel(\"x\")\n  ylabel(\"y\")\n  k = string(i)\n  k = repeat(\"0\", 3-length(k))*k \n  title(\"t = $k\")\n  ylim(-0.05,0.25)\n  gca().invert_yaxis()\n  savefig(\"u$k.png\")\nend","category":"page"},{"location":"heatequation/#Heat-Equation-1","page":"Heat Equation","title":"Heat Equation","text":"","category":"section"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"The strong form of the initial/boundary-value problem of the heat equation is: given f, u_0, q, find ubarOmegatimes 0Trightarrow mathbbR such that","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"beginaligned\nrhofracpartial upartial t - nablacdot(Knabla u) = f Omegatimes (0T)\nu = u_0  Gamma_Dtimes (0T)\nKfracpartial upartial n = q Gamma_Ntimes (0T)\nendaligned","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"The corresponding weak form is: given f, u_0 and q , find u, such that for all w","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"int_Omega rhofracpartial upartial tdelta u mathrmdx + int_Omega Knabla u cdot nabla delta u mathrmd x = int_Omega fdelta u mathrmd x + int_Gamma_N q delta u mathrmdx","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"The computational domain is as follows: the top side is the inflow boundary condition and the other sides are Dirichlet boundary condition. ","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"(Image: )","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"We consider the manufactured solution ","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"u(x t) = (x_1^2+x_2^2)e^-tquad rho(x) = (1+x_1^2+x_2^2)","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"and ","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"K = beginbmatrix\n2  1 \n1  2\nendbmatrix","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"Then we have","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"beginaligned\nf(x) = -(1+x_1^2+x_2^2)(x_1^2+x_2^2) e^-t - 8 e^-t\nq(x) = -(2x+4y)e^-t\nendaligned","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"m = 40\nn = 20\nh = 0.01\nbdedge = []\nfor i = 1:m \n  push!(bdedge, [i i+1])\nend\nbdedge = vcat(bdedge...)\n\nbdnode = Int64[]\nfor j = 1:n+1\n  push!(bdnode, (j-1)*(m+1)+1)\n  push!(bdnode, (j-1)*(m+1)+m+1)\nend\nfor i = 2:m\n  push!(bdnode, n*(m+1)+i)\nend\n\nρ = eval_f_on_gauss_pts((x,y)->1+x^2+y^2, m, n, h)\nM = compute_fem_mass_matrix1(ρ, m, n, h)\n\nK_ = [2.0 1.0\n  1.0 2.0]\nK = compute_fem_stiffness_matrix1(K_, m, n, h)\n\nNT = 200\nΔt = 1/NT \nA = M/Δt+K \nA, Abd = fem_impose_Dirichlet_boundary_condition1(A, bdnode, m, n, h)\nU = zeros((m+1)*(n+1), NT+1)\nfor i = 1:m+1\n  for j = 1:n+1\n    x = (i-1)*h; y = (j-1)*h \n    U[(j-1)*(m+1)+i, 1] = x^2+y^2\n  end\nend\nfor i = 1:NT \n  F = eval_f_on_gauss_pts((x,y)->(-(1+x^2+y^2)*(x^2+y^2)-8)*exp(-i*Δt), m, n, h)\n  F = compute_fem_source_term1(F, m, n, h)\n\n  T = eval_f_on_boundary_edge((x,y)->-(2*x+4*y)*exp(-i*Δt), bdedge, m, n, h)\n  T = compute_fem_flux_term1(T, bdedge, m, n, h)\n\n  rhs = F  + M*U[:,i]/Δt + T\n  bdval = eval_f_on_boundary_node( (x,y)->(x^2+y^2)*exp(-i*Δt), bdnode, m, n, h)\n  rhs[bdnode] = bdval\n  U[:,i+1] = A\\(\n    rhs - Abd*bdval\n  )\nend\n\nUexact = zeros(n+1,m+1)\nfor j = 1:n+1\n  for i = 1:m+1\n    x = (i-1)*h; y = (j-1)*h \n    Uexact[j, i] = (x^2+y^2)*exp(-1)\n  end\nend\npcolormesh(reshape(U[:,end], m+1, n+1)'-Uexact); colorbar()","category":"page"},{"location":"heatequation/#","page":"Heat Equation","title":"Heat Equation","text":"(Image: )","category":"page"}]
}
