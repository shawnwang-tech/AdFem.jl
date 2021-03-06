using ADCME
using LinearAlgebra
using MAT
using AdFem
using PyPlot
using SparseArrays


SMALL_SIZE = 22
MEDIUM_SIZE = 24
BIGGER_SIZE = 24

plt.rc("font", size=SMALL_SIZE)          # controls default text sizes
plt.rc("axes", titlesize=SMALL_SIZE)     # fontsize of the axes title
plt.rc("axes", labelsize=MEDIUM_SIZE)    # fontsize of the x and y labels
plt.rc("xtick", labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc("ytick", labelsize=SMALL_SIZE)    # fontsize of the tick labels
plt.rc("legend", fontsize=SMALL_SIZE)    # legend fontsize
plt.rc("figure", titlesize=BIGGER_SIZE)  # fontsize of the figure title

# Example 2: 

function u_exact(x,y)
    x*(1-x)*y*(1-y)
end

function v_exact(x,y)
    x*(1-x)*y*(1-y)
end

function p_exact(x,y)
    x*(1-x)*y*(1-y)
end

function t_exact(x,y)
    x*(1-x)*y*(1-y)
end

function k_exact(x,y)
    1 + x^2 + x / (1+y^2)
end

function k_nn(x, y)
    out = fc([x y], [20,20,20,1])^2 + 0.5 # N x 1 
    squeeze(out)
end

function ffunc_(x, y)
    x*y*(1 - x)*(1 - y)*(-x*y*(1 - x) + x*(1 - x)*(1 - y)) + x*y*(1 - x)*(1 - y)*(-x*y*(1 - y) + y*(1 - x)*(1 - y)) - x*y*(1 - y) + 0.02*x*(1 - x) + y*(1 - x)*(1 - y) + 0.02*y*(1 - y)    
end

function gfunc_(x, y)
    x*y*(1 - x)*(1 - y)*(-x*y*(1 - x) + x*(1 - x)*(1 - y)) + x*y*(1 - x)*(1 - y)*(-x*y*(1 - y) + y*(1 - x)*(1 - y)) - x*y*(1 - x)*(1 - y) - x*y*(1 - x) + x*(1 - x)*(1 - y) + 0.02*x*(1 - x) + 0.02*y*(1 - y)
end

function hfunc_(x,y)
    -x*y*(1 - x) - x*y*(1 - y) + x*(1 - x)*(1 - y) + y*(1 - x)*(1 - y)
end

function heat_source_func(x, y)
    # x^2*y*(x - 1)^2*(y - 1)*(2*y - 1) + x*y^2*(x - 1)*(2*x - 1)*(y - 1)^2 - 2.0*x*(x - 1) - 2.0*y*(y - 1)    # if k=1.0
    (2*x^2*y*(x - 1)*(2*y - 1) + x*y*(x - 1)*(y - 1)*(y^2 + 1)^2*(x*(x - 1)*(2*y - 1) + y*(2*x - 1)*(y - 1)) - (y^2 + 1)*(2*x*(x - 1)*(x + (x^2 + 1)*(y^2 + 1)) + 2*y*(x + (x^2 + 1)*(y^2 + 1))*(y - 1) + y*(2*x - 1)*(y - 1)*(2*x*(y^2 + 1) + 1)))/(y^2 + 1)^2
end

using LinearAlgebra
using MAT
using AdFem
using PyPlot
using SparseArrays

m = 20
n = 20
h = 1/n
nu = 0.01

F1 = compute_fem_source_term1(eval_f_on_gauss_pts(ffunc_, m, n, h), m, n, h)
F2 = compute_fem_source_term1(eval_f_on_gauss_pts(gfunc_, m, n, h), m, n, h)
H = h^2*eval_f_on_fvm_pts(hfunc_, m, n, h)
B = constant(compute_interaction_matrix(m, n, h))

# compute F
Laplace = nu * constant(compute_fem_laplace_matrix1(m, n, h))
heat_source = eval_f_on_gauss_pts(heat_source_func, m, n, h)
heat_source = constant(compute_fem_source_term1(heat_source, m, n, h))

xy = fem_nodes(m, n, h)
x, y = xy[:, 1], xy[:, 2]
k0 = @. k_exact(x, y)
k = @. k_nn(x, y); k=stack(k)
kgauss = fem_to_gauss_points(k, m, n, h)
LaplaceK = compute_fem_laplace_matrix1(kgauss, m, n, h)

function compute_residual(S)
    u, v, p, T = S[1:(m+1)*(n+1)], 
        S[(m+1)*(n+1)+1:2(m+1)*(n+1)], 
        S[2(m+1)*(n+1)+1:2(m+1)*(n+1)+m*n],
        S[2(m+1)*(n+1)+m*n+1:end]
    G = eval_grad_on_gauss_pts([u;v], m, n, h)
    ugauss = fem_to_gauss_points(u, m, n, h)
    vgauss = fem_to_gauss_points(v, m, n, h)
    ux, uy, vx, vy = G[:,1,1], G[:,1,2], G[:,2,1], G[:,2,2]

    interaction = compute_interaction_term(p, m, n, h) # julia kernel needed
    f1 = compute_fem_source_term1(ugauss.*ux, m, n, h)
    f2 = compute_fem_source_term1(vgauss.*uy, m, n, h)
    f3 = -interaction[1:(m+1)*(n+1)]
    f4 = Laplace*u 
    f5 = -F1
    F = f1 + f2 + f3 + f4 + f5 

    g1 = compute_fem_source_term1(ugauss.*vx, m, n, h)
    g2 = compute_fem_source_term1(vgauss.*vy, m, n, h)
    g3 = -interaction[(m+1)*(n+1)+1:end]    
    g4 = Laplace*v 
    g5 = -F2
    T_gauss = fem_to_gauss_points(T, m, n, h)
    buoyance_term = -compute_fem_source_term1(T_gauss, m, n, h)

    G = g1 + g2 + g3 + g4 + g5 + buoyance_term

    H0 = -B * [u;v] + H

    T0 = LaplaceK * T + compute_fem_advection_matrix1(ugauss,vgauss, m, n, h) * T - heat_source
    R = [F;G;H0;T0]
    return R
end

function compute_jacobian(S)
    u, v, p, T = S[1:(m+1)*(n+1)], 
        S[(m+1)*(n+1)+1:2(m+1)*(n+1)], 
        S[2(m+1)*(n+1)+1:2(m+1)*(n+1)+m*n],
        S[2(m+1)*(n+1)+m*n+1:end]
        
    G = eval_grad_on_gauss_pts([u;v], m, n, h)
    ugauss = fem_to_gauss_points(u, m, n, h)
    vgauss = fem_to_gauss_points(v, m, n, h)
    ux, uy, vx, vy = G[:,1,1], G[:,1,2], G[:,2,1], G[:,2,2]

    M1 = constant(compute_fem_mass_matrix1(ux, m, n, h))
    M2 = constant(compute_fem_advection_matrix1(constant(ugauss), constant(vgauss), m, n, h)) # a julia kernel needed
    M3 = Laplace
    Fu = M1 + M2 + M3 

    Fv = constant(compute_fem_mass_matrix1(uy, m, n, h))

    N1 = constant(compute_fem_mass_matrix1(vy, m, n, h))
    N2 = constant(compute_fem_advection_matrix1(constant(ugauss), constant(vgauss), m, n, h))
    N3 = Laplace
    Gv = N1 + N2 + N3 

    Gu = constant(compute_fem_mass_matrix1(vx, m, n, h))

    M = LaplaceK + constant(compute_fem_advection_matrix1(ugauss,vgauss, m, n, h))

    gradT = eval_grad_on_gauss_pts1(T, m, n, h)
    Tx, Ty = gradT[:,1], gradT[:,2]
    DU_TX = constant(compute_fem_mass_matrix1(Tx, m, n, h))       # (m+1)*(n+1), (m+1)*(n+1)
    DV_TY = constant(compute_fem_mass_matrix1(Ty, m, n, h))       # (m+1)*(n+1), (m+1)*(n+1)

    T_mat = -constant(compute_fem_mass_matrix1(m, n, h))
    T_mat = [SparseTensor(spzeros((m+1)*(n+1), (m+1)*(n+1))); T_mat]

    J0 = [Fu Fv
          Gu Gv]

    J1 = [J0 -B' T_mat
        -B spdiag(zeros(size(B,1))) SparseTensor(spzeros(m*n, (m+1)*(n+1)))]
    
    N = 2*(m+1)*(n+1) + m*n 
    J = [J1 
        [DU_TX DV_TY SparseTensor(spzeros((m+1)*(n+1), m*n)) M]]
end

NT = 5    # number of iterations for Newton's method

bd = bcnode("all", m, n, h)
bd = [bd; bd .+ (m+1)*(n+1); 
    2*(m+1)*(n+1)+(n-1)*m+1:2*(m+1)*(n+1)+(n-1)*m+2;
    (2*(m+1)*(n+1)+m*n) .+ bd] 
# only apply Dirichlet to velocity; set left bottom two points to zero to fix rank deficient problem for pressure


function solve_steady_cavityflow_one_step(S)
    residual = compute_residual(S)
    J = compute_jacobian(S)
    
    J, _ = fem_impose_Dirichlet_boundary_condition1(J, bd, m, n, h)
    residual = scatter_update(residual, bd, zeros(length(bd)))    # residual[bd] .= 0.0 in Tensorflow syntax

    d = J\residual
    residual_norm = norm(residual)
    op = tf.print("residual norm", residual_norm)
    d = bind(d, op)
    S_new = S - d
    return S_new
end


function condition(i, S_arr)
    i <= NT + 1
end

function body(i, S_arr)
    S = read(S_arr, i-1)
    op = tf.print("i=",i)
    i = bind(i, op)
    S_new = solve_steady_cavityflow_one_step(S)
    S_arr = write(S_arr, i, S_new)
    return i+1, S_arr
end

xy = fem_nodes(m, n, h)
x, y = xy[:,1], xy[:,2]
u0 = @. u_exact(x,y)
v0 = @. v_exact(x,y)
t0 = @. t_exact(x,y)

xy = fvm_nodes(m, n, h)
x, y = xy[:,1], xy[:,2]
p0 = @. p_exact(x,y)

S_arr = TensorArray(NT+1)
S_arr = write(S_arr, 1, zeros(m*n+3*(m+1)*(n+1)))

i = constant(2, dtype=Int32)

_, S = while_loop(condition, body, [i, S_arr])
S = set_shape(stack(S), (NT+1, 2*(m+1)*(n+1)+m*n+(m+1)*(n+1)))
V_computed = S[end, :]

V_data = matread("sess_figures/ex2/SteadyStateBoussinesq_data.mat")["V"]

sample_size = 40
idx = matread("sess_figures/ex2/noise5/idx.mat")["idx"]
observed_data = V_data[idx]


# noise = true
# noise_level = 0.05
# if noise
#     noise_ratio = (1 - noise_level) .+ 2 * noise_level * rand(Float64, size(observed_data)) # uniform on (1-noise_level, 1+noise_level)
#     observed_data = observed_data .* noise_ratio
# end

loss = mean((V_computed[idx] .- observed_data)^2)
loss = loss * 1e10


idx = idx[1:40]
# ---------------------------------------------------
sess = Session(); init(sess)


ADCME.load(sess, "sess_figures/ex2/noise5/nn1.mat")

xy = fem_nodes(m, n, h)
obs_x, obs_y = xy[idx, 1], xy[idx, 2]

figure();visualize_scalar_on_fem_points(k0, m, n, h); 
scatter(obs_x, obs_y, s=100, marker="<", c="#ff0000", zorder=999)
tight_layout()
savefig("sess_figures/ex2/noise5/conductivity_exact.png")

figure();visualize_scalar_on_fem_points(run(sess, k), m, n, h); #gca().invert_yaxis()
scatter(obs_x, obs_y, s=100, marker="<", c="#ff0000", zorder=999)
tight_layout()
savefig("sess_figures/ex2/noise5/conductivity_prediction.png")

figure();visualize_scalar_on_fem_points(k0.-run(sess, k), m, n, h);
scatter(obs_x, obs_y, s=100, marker="<", c="#ff0000", zorder=999)
tight_layout()
savefig("sess_figures/ex2/noise5/conductivity_error.png")
