for file in nn param simple space_k 
do
    mkdir $file
    cp invdata.jld2 $file 
    cp coupled_$file.jl $file 
    cd $file 
    julia coupled_$file.jl & 
    cd ..
done
wait