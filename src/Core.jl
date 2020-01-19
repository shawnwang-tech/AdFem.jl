export compute_fem_stiffness_matrix,
compute_fem_source_term,
trim_fem,
eval_f_on_gauss_pts,
compute_interaction_matrix,
compute_fvm_source_term,
compute_fvm_mechanics_term,
compute_fluid_mass_matrix,
trim_coupled

####################### Mechanics #######################
@doc raw"""
    compute_fem_stiffness_matrix(K::Array{Float64,2}, m::Int64, n::Int64, h::Float64)

Computes the term 
```math
\int_{A}\delta \varepsilon :\sigma'\mathrm{d}x = \int_A u_AB^TDB\delta u_A\mathrm{d}x
```
"""
function compute_fem_stiffness_matrix(K::Array{Float64,2}, m::Int64, n::Int64, h::Float64)
    I = Int64[]; J = Int64[]; V = Float64[]
    function add(ii, jj, kk)
        for  i = 1:length(ii)
            for j = 1:length(jj)
                push!(I,ii[i])
                push!(J,jj[j])
                push!(V,kk[i,j])
            end
        end
    end
    Ω = zeros(8,8)
    for i = 1:2
        for j = 1:2
            η = pts[i]; ξ = pts[j]
            B = [
                -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η 0.0 0.0 0.0 0.0
                0.0 0.0 0.0 0.0 -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ
                -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η
            ]
            Ω += B'*K*B*0.25*h^2
        end
    end
       
    for i = 1:m
        for j = 1:n 
            ii = [i;i+1;i;i+1]
            jj = [j;j;j+1;j+1]
            kk = @. (jj-1)*(m+1) + ii
            kk = [kk; kk .+ (m+1)*(n+1)]
            add(kk, kk, Ω)
        end
    end
    return sparse(I, J, V, (m+1)*(n+1)*2, (m+1)*(n+1)*2)
end

@doc raw"""
    compute_fem_source_term(f1::Array{Float64}, f2::Array{Float64},
                             m::Int64, n::Int64, h::Float64)

Computes the term 
```math
\int_\Omega f\cdot\delta u dx
```
"""
function compute_fem_source_term(f1::Array{Float64}, f2::Array{Float64},
                             m::Int64, n::Int64, h::Float64)
    rhs = zeros((m+1)*(n+1)*2)
    k = 0
    for i = 1:m
        for j = 1:n
            for p = 1:2
                for q = 1:2

                    k += 1
                    val1 = f1[k] * h^2 * 0.25
                    val2 = f2[k] * h^2 * 0.25
                    
                    rhs[(j-1)*(m+1) + i] += val1 
                    rhs[(j-1)*(m+1) + i+1] += val1 
                    rhs[j*(m+1) + i] += val1 
                    rhs[j*(m+1) + i+1] += val1 

                    rhs[(m+1)*(n+1) + (j-1)*(m+1) + i] += val2
                    rhs[(m+1)*(n+1) + (j-1)*(m+1) + i+1] += val2
                    rhs[(m+1)*(n+1) + j*(m+1) + i] += val2
                    rhs[(m+1)*(n+1) + j*(m+1) + i+1] += val2
                    
                end
            end
            
        end
    end
    return rhs
end

@doc raw"""
    trim_fem(A::SparseMatrixCSC{Float64,Int64}, 
        bd::Array{Int64}, m::Int64, n::Int64, h::Float64)

Imposes the Dirichlet boundary conditions on the matrix `A`
"""
function trim_fem(A::SparseMatrixCSC{Float64,Int64}, 
    bd::Array{Int64}, m::Int64, n::Int64, h::Float64)
    A[bd,:] = spzeros(length(bd), 2(m+1)*(n+1))
    A[:,bd] = spzeros(2(m+1)*(n+1), length(bd))
    A[bd,bd] = spdiagm(0=>ones(length(bd)))
    A
end

@doc raw"""
    eval_f_on_gauss_pts(f::Function, m::Int64, n::Int64, h::Float64)

Evaluates `f` at Gaussian points and return the result as $4mn$ vector `out` (4 Gauss points per element)
"""
function eval_f_on_gauss_pts(f::Function, m::Int64, n::Int64, h::Float64)
    out = zeros(4*m*n)
    k = 0
    for i = 1:m 
        for j = 1:n 
            x1 = (i-1)*h 
            y1 = (j-1)*h
            for p = 1:2
                for q = 1:2
                    η = pts[p]; ξ = pts[q]
                    x = x1 + ξ*h; y = y1 + η*h
                    k += 1
                    out[k] = f(x, y)
                end
            end
        end
    end
    out
end

####################### Interaction #######################
@doc raw"""
    compute_interaction_matrix(m::Int64, n::Int64, h::Float64)

Computes the interaction term 
```math
\int_A p \delta \varepsilon_v\mathrm{d}x = \int_A p [1,1,0]B^T\delta u_A\mathrm{d}x
```
"""
function compute_interaction_matrix(m::Int64, n::Int64, h::Float64)
    I = Int64[]
    J = Int64[]
    V = Float64[]
    function add(k1, k2, v)
        push!(I, k1)
        push!(J, k2)
        push!(V, v)
    end
    B = zeros(4, 3, 8)
    for i = 1:2
        for j = 1:2
            η = pts[i]; ξ = pts[j]
            B[(j-1)*2+i,:,:] = [
                -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η 0.0 0.0 0.0 0.0
                0.0 0.0 0.0 0.0 -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ
                -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η
            ]
        end
    end
    for i = 1:m 
        for j = 1:n 
            for p = 1:2
                for q = 1:2
                    idx = [(j-1)*(m+1)+i;(j-1)*(m+1)+i+1;j*(m+1)+i;j*(m+1)+i+1]
                    idx = [idx; idx .+ (m+1)*(n+1)]
                    Bk = B[(q-1)*2+p,:,:]
                    Bk = [1. 1. 0.]*Bk # 1 x 8
                    for s = 1:8
                        add((j-1)*m+i, idx[s], Bk[1,s]*0.25*h^2)
                    end
                end
            end
        end
    end
    sparse(I, J, V, m*n, 2(m+1)*(n+1))
end



####################### Fluids #######################
@doc raw"""
    compute_fvm_source_term(f::Array{Float64}, m::Int64, n::Int64, h::Float64)

Computes the source term 
```math
\int_{A_i} f\mathrm{d}x
```
"""
function compute_fvm_source_term(f::Array{Float64}, m::Int64, n::Int64, h::Float64)
    out = zeros(m*n)
    @assert length(f) == 4*m*n 
    for i = 1:m 
        for j = 1:n 
            k = (j-1)*m + i 
            out[k] = 0.25*h^2*sum(f[4*(k-1)+1:4*k])
        end
    end
    out
end

@doc raw"""
    compute_fvm_mechanics_term(u::Array{Float64}, m::Int64, n::Int64, h::Float64)

Computes the mechanic interaction term 
```math
\int_{A_i} \varepsilon_v\mathrm{d}x
```
"""
function compute_fvm_mechanics_term(u::Array{Float64}, m::Int64, n::Int64, h::Float64)
    out = zeros(m*n)
    B = zeros(4, 3, 8)
    for i = 1:2
        for j = 1:2
            η = pts[i]; ξ = pts[j]
            B[(j-1)*2+i,:,:] = [
                -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η 0.0 0.0 0.0 0.0
                0.0 0.0 0.0 0.0 -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ
                -1/h*(1-ξ) -1/h*ξ 1/h*(1-ξ) 1/h*ξ -1/h*(1-η) 1/h*(1-η) -1/h*η 1/h*η
            ]
        end
    end
    for i = 1:m 
        for j = 1:n
            for p = 1:2
                for q = 1:2
                    idx = [(j-1)*(m+1)+i;(j-1)*(m+1)+i+1;j*(m+1)+i;j*(m+1)+i+1]
                    idx = [idx; idx .+ (m+1)*(n+1)]
                    Bk = B[(q-1)*2+p,:,:]
                    Bk = [1. 1. 0.]*Bk*u[idx]
                    out[(j-1)*m+i] += Bk[1,1]
                end
            end
        end
    end
    out
end

@doc raw"""
    compute_fluid_mass_matrix(m::Int64, n::Int64, h::Float64)

Computes the term with two-point flux approximation 
```math
\int_{A_i} \Delta p \mathrm{d}x
```
"""
function compute_fluid_mass_matrix(m::Int64, n::Int64, h::Float64)
    I = Int64[]; J = Int64[]; V = Float64[]
    function add(i, j, v)
        push!(I, i)
        push!(J, j)
        push!(V, v)
    end
    for i = 1:m 
        for j = 1:n 
            k = (j-1)*m + i
            for (ii,jj) in [(i+1,j),(i-1,j),(i,j+1),(i,j-1)]
                if 1<=ii<=m && 1<=jj<=n
                    kp = (jj-1)*m + ii
                    add(k, kp, -1.)
                    add(k, k, 1.)
                end
            end
        end
    end
    sparse(I, J, V, m*n, m*n)
end

@doc raw"""

"""
function trim_coupled(Q::SparseMatrixCSC{Float64,Int64}, L::SparseMatrixCSC{Float64,Int64}, M::SparseMatrixCSC{Float64,Int64}, 
    bd::Array{Int64}, m::Int64, n::Int64, h::Float64)
    A = [M -L'
        L Q]
    A[bd,:] = spzeros(length(bd), 2(m+1)*(n+1)+m*n)
    A[:, bd] = spzeros(2(m+1)*(n+1)+m*n, length(bd))
    A[bd, bd] = spdiagm(0=>ones(length(bd)))
    dropzeros(A)
end