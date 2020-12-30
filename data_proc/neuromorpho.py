from genepy3d.obj.trees import Tree
import matplotlib as mpl
import matplotlib.pyplot as plt
from mpl_toolkits import mplot3d

import numpy as np

def plot_line(ax,projection,x,y,z,scales=(1.,1.,1.),line_args={}):
    """Support plotting a line.

    Args:
        ax: axis to be plotted.
        projection (str): support *3d, xy, xz, yz*.
        x (float): x coordinate.
        y (float): y coordinate.
        z (float): z coordinate.
        scales (tuple of float): axis scales.
        line_args (dic): matplotlib args for line plot.

    """

    x = x / scales[0]
    y = y / scales[1]
    z = z / scales[2]

    if projection=='3d':
        pl = ax.plot(x,y,z,**line_args)
    else:
        if projection=='xy':
            _x, _y = x, y
        elif projection=='xz':
            _x, _y = x, z
        else:
            _x, _y = y, z

        pl = ax.plot(_x,_y,**line_args)

    return pl


#From http://neuromorpho.org/neuron_info.jsp?neuron_name=Neuron-2-2
filename = "Neuron-2-2.CNG.swc"
neuron = Tree.from_swc(filename)
print('Neuron converted!')
short_summary = neuron.summary()
print(short_summary)
print(neuron.get_branchingnodes())

r_lst = np.arange(1,51,5)
df = neuron.compute_local_3d_scale(r_lst)

meandf = df.groupby("nodeid")["local_scale"].mean()

'''
fig = plt.figure()
ax = fig.add_subplot(111,projection="3d")
neuron.plot(ax)
plt.show()
'''

fig = plt.figure()
ax = fig.add_subplot(111,projection="3d")
neuron.plot(ax,weights=meandf,point_args={"cmap":"rainbow"},
            show_cbar=False,cbar_args={"shrink":0.5})
plt.tight_layout();

plt.show()

'''
_rootid = neuron.get_root()[0]
spine_nodes = neuron.compute_spine(_rootid)
coors = neuron.get_coordinates(spine_nodes).values
x, y, z = coors[:,0], coors[:,1], coors[:,2]

print(coors)

fig = plt.figure()
ax = fig.add_subplot(111,projection="3d")
plot_line(ax,"3d",x,y,z)
plt.tight_layout()
plt.show()
'''
