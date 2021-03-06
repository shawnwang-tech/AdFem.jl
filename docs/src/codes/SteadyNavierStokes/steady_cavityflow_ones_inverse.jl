# reset_default_graph()
# using SymPy 

# x, y = @vars x y
# u = x*(1-x)*y*(1-y)
# v = x*(1-x)*y*(1-y)^2

# p = x*(1-x)*y*(1-y)

# ux = diff(u,x)
# uy = diff(u,y)
# vx = diff(v,x)
# vy = diff(v,y)
# px = diff(p,x)
# py = diff(p,y)
# f = u*ux + v*uy - (diff(ux,x)+diff(uy,y)) + px
# g = u*vx + v*vy - (diff(vx,x)+diff(vy,y)) + py
# h = diff(u, x) + diff(v, y)
# println(replace(replace(sympy.julia_code(simplify(f)), ".^"=>"^"), ".*"=>"*"))
# println(replace(replace(sympy.julia_code(simplify(g)), ".^"=>"^"), ".*"=>"*"))
# println(replace(replace(sympy.julia_code(simplify(h)), ".^"=>"^"), ".*"=>"*"))

function u_exact(x,y)
    if y == 0.0
        return 1.0
    else
        return 0.0    
    end
end

function v_exact(x,y)
    0.0
end

function p_exact(x,y)
    0.0
end

function ffunc(x, y)
    #-x^2*y*(x - 1)^2*(y - 1)^2*(2*y - 1) + x*y^2*(x - 1)*(2*x - 1)*(y - 1)^2 + x*y*(y - 1) - 2*x*(x - 1) + y*(x - 1)*(y - 1) - 2*y*(y - 1)
    0.0
end
function gfunc(x, y)
    #x^2*y*(x - 1)^2*(y - 1)^3*(3*y - 1) - x*y^2*(x - 1)*(2*x - 1)*(y - 1)^3 + 3*x*y*(x - 1) + 5*x*(x - 1)*(y - 1) + 2*y*(y - 1)^2
    0.0
end

function hfunc(x,y)
    # (y - 1)*(-2*x*y*(x - 1) + x*y - x*(x - 1)*(y - 1) + y*(x - 1))
    0.0
end

# nn to estimate space varying viscosity
function nu_exact(x, y)
    1 + 6 * x^2 + x / (1 + 2 * y^2)
    # 1 + x^2 + x / (1 + 2 * y^2)
    # 1 + x^2
end

using LinearAlgebra
using MAT
using AdFem
using PyPlot
using SparseArrays

m = 20
n = 20
h = 1/n
# nu = 0.01


F1 = compute_fem_source_term1(eval_f_on_gauss_pts(ffunc, m, n, h), m, n, h)
F2 = compute_fem_source_term1(eval_f_on_gauss_pts(gfunc, m, n, h), m, n, h)
H = h^2*eval_f_on_fvm_pts(hfunc, m, n, h)
B = constant(compute_interaction_matrix(m, n, h))

# compute F
xy = fem_nodes(m, n, h)
x, y = xy[:,1], xy[:,2]
u0 = @. u_exact(x,y)
v0 = @. v_exact(x,y)

xy = fvm_nodes(m, n, h)
x, y = xy[:,1], xy[:,2]
p0 = @. p_exact(x,y)
# nu_gauss = Variable(ones(4*m*n))
nu_fvm = Variable(ones(m*n))
nu_gauss = reshape(repeat(nu_fvm, 1, 4), (-1,))

Laplace = compute_fem_laplace_matrix1(nu_gauss, m, n, h)


# Laplace = constant(nu*compute_fem_laplace_matrix1(m, n, h))
function compute_residual(S)
    u, v, p = S[1:(m+1)*(n+1)], S[(m+1)*(n+1)+1:2(m+1)*(n+1)], S[2(m+1)*(n+1)+1:2(m+1)*(n+1)+m*n]
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
    G = g1 + g2 + g3 + g4 + g5

    H0 = -B * [u;v] + H

    R = [F;G;H0]
    return R
end

function compute_jacobian(S)
    u, v, p = S[1:(m+1)*(n+1)], S[(m+1)*(n+1)+1:2(m+1)*(n+1)], S[2(m+1)*(n+1)+1:2(m+1)*(n+1)+m*n]
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

    J0 = [Fu Fv
          Gu Gv]
    J = [J0 -B'
        -B spdiag(zeros(size(B,1)))]
end

NT = 5
# S = zeros(m*n+2(m+1)*(n+1), NT+1)
# S[1:m+1, 1] = ones(m+1,1)

bd = bcnode("all", m, n, h)
# bd = [bd; bd .+ (m+1)*(n+1); ((1:m) .+ 2(m+1)*(n+1))]
bd = [bd; bd .+ (m+1)*(n+1); 2*(m+1)*(n+1)+(n-1)*m+1:2*(m+1)*(n+1)+(n-1)*m+2] # only apply Dirichlet to velocity


function solve_steady_cavityflow_one_step(S)
    residual = compute_residual(S)
    J = compute_jacobian(S)
    
    J, _ = fem_impose_Dirichlet_boundary_condition1(J, bd, m, n, h)
    # residual[bd] .= 0.0
    residual = scatter_update(residual, bd, zeros(length(bd)))

    d = J\residual
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

# for i = 1:NT 
#     residual = compute_residual(S[:,i])
#     J = compute_jacobian(S[:,i])
    
#     J, _ = fem_impose_Dirichlet_boundary_condition1(J, bd, m, n, h)
#     residual[bd] .= 0.0


#     d = J\residual
#     S[:,i+1] = S[:,i] - d
#     @info i, norm(residual)
# end


function plot_velocity_pressure_viscosity(k) 

    figure(figsize=(14,4));
    subplot(131)
    visualize_scalar_on_fem_points(S_true[end, 1:(m+1)*(n+1)], m, n, h); title("velocity x data")
    subplot(132)
    visualize_scalar_on_fem_points(run(sess, S[end,1:(m+1)*(n+1)]), m, n, h); title("velocity x prediction")
    subplot(133)
    visualize_scalar_on_fem_points(S_true[end, 1:(m+1)*(n+1)] - run(sess, S[end,1:(m+1)*(n+1)]), m, n, h); title("velocity x error")
    savefig("figures_ones6_fvm/steady_xy_nn_velox$k.png")
    # savefig("steady_xy_ones_velox.png")

    figure(figsize=(14,4));
    subplot(131)
    visualize_scalar_on_fem_points(S_true[end, (m+1)*(n+1)+1:2*(m+1)*(n+1)], m, n, h); title("velocity y data")
    subplot(132)
    visualize_scalar_on_fem_points(run(sess, S[end,(m+1)*(n+1)+1:2*(m+1)*(n+1)]), m, n, h); title("velocity y prediction")
    subplot(133)
    visualize_scalar_on_fem_points(S_true[end, (m+1)*(n+1)+1:2*(m+1)*(n+1)] - run(sess, S[end,(m+1)*(n+1)+1:2*(m+1)*(n+1)]), m, n, h); title("velocity y error")
    savefig("figures_ones6_fvm/steady_xy_nn_veloy$k.png")
    # savefig("steady_xy_ones_veloy.png")


    figure(figsize=(14,4));
    subplot(131)
    visualize_scalar_on_fvm_points(S_true[end, 2*(m+1)*(n+1)+1:end], m, n, h); title("pressure data")
    subplot(132)
    visualize_scalar_on_fvm_points(run(sess, S[end,2*(m+1)*(n+1)+1:end]), m, n, h); title("pressure prediction")
    subplot(133)
    visualize_scalar_on_fvm_points(S_true[end, 2*(m+1)*(n+1)+1:end] - run(sess, S[end,2*(m+1)*(n+1)+1:end]), m, n, h); title("pressure difference")
    savefig("figures_ones6_fvm/steady_xy_nn_pres$k.png")
    # savefig("steady_xy_ones_pres.png")


    figure(figsize=(14,4));
    subplot(131)
    visualize_scalar_on_fvm_points(nu_exact.(x,y), m, n, h); title("viscosity exact")
    subplot(132)
    visualize_scalar_on_gauss_points(run(sess, nu_gauss), m, n, h); title("viscosity prediction");gca().invert_yaxis()
    subplot(133)
    visualize_scalar_on_fvm_points(nu_exact.(x,y).-run(sess, nu_gauss)[1:4:end], m, n, h); title("viscosity difference")
    savefig("figures_ones6_fvm/steady_xy_nn_visc$k.png")
    # savefig("steady_xy_ones_visc.png")

end



S_arr = TensorArray(NT+1)
S_arr = write(S_arr, 1, [u0; v0; p0])

i = constant(2, dtype=Int32)

_, S = while_loop(condition, body, [i, S_arr])
S = set_shape(stack(S), (NT+1, 2*(m+1)*(n+1)+m*n))

S_true = matread("steady_cavity_data.mat")["V"]
loss = mean((S[end,1:2*(m+1)*(n+1)] - S_true[end,1:2*(m+1)*(n+1)])^2)

# loss = mean((S[end,:] - S_true[end,:])^2)
loss = loss * 1e10

sess = Session(); init(sess)
@info run(sess, loss)

max_iter = 1000

# ADCME.load(sess, "nn$k.mat")

for k = 1:100
    loss_ = BFGS!(sess, loss, max_iter)
    matwrite("figures_ones6_fvm/loss$k.mat", Dict("L"=>loss_))
    close("all"); semilogy(loss_); title("loss vs. iteration")
    savefig("figures_ones6_fvm/steady_xy_loss$k.png")
    plot_velocity_pressure_viscosity(k)
    ADCME.save(sess, "figures_ones6_fvm/nn$k.mat")
end
# savefig("steady_xy_ones_loss.png")
